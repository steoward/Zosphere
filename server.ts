import express from 'express';
import { createServer as createViteServer } from 'vite';
import cookieParser from 'cookie-parser';
import { google } from 'googleapis';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cookieParser());
app.use(express.json());

// OAuth2 Client setup
const getOAuth2Client = (req?: express.Request) => {
  const baseUrl = (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  const redirectUri = `${baseUrl}/auth/callback`;

  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );
};

app.get('/api/auth/url', (req, res) => {
  const oauth2Client = getOAuth2Client(req);
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    prompt: 'consent'
  });
  res.json({ url });
});

app.get(['/auth/callback', '/auth/callback/'], async (req, res) => {
  const { code } = req.query;
  if (!code || typeof code !== 'string') {
    return res.status(400).send('Missing code');
  }

  try {
    const oauth2Client = getOAuth2Client(req);
    const { tokens } = await oauth2Client.getToken(code);

    res.cookie('google_auth_tokens', JSON.stringify(tokens), {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. You can close this window.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).send('Authentication failed');
  }
});

app.post('/api/drive/upload', async (req, res) => {
  const tokenCookie = req.cookies.google_auth_tokens;
  if (!tokenCookie) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { name, content, mimeType, folderId } = req.body;
    const tokens = JSON.parse(tokenCookie);
    const oauth2Client = getOAuth2Client(req);
    oauth2Client.setCredentials(tokens);

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const fileMetadata: any = {
      name,
    };
    if (folderId) {
      fileMetadata.parents = [folderId];
    }

    const media = {
      mimeType: mimeType || 'text/plain',
      body: content,
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, iconLink, mimeType',
    });

    res.json({ file: file.data });
  } catch (error) {
    console.error('Drive API upload error:', error);
    res.status(500).json({ error: 'Failed to upload file to Drive' });
  }
});

app.get('/api/auth/status', async (req, res) => {
  const tokenCookie = req.cookies.google_auth_tokens;
  if (!tokenCookie) {
    return res.json({ authenticated: false });
  }

  try {
    const tokens = JSON.parse(tokenCookie);
    const oauth2Client = getOAuth2Client(req);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    res.json({
      authenticated: true,
      user: userInfo.data
    });
  } catch (error) {
    res.json({ authenticated: false });
  }
});

app.get('/api/auth/logout', (req, res) => {
  res.clearCookie('google_auth_tokens', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });
  res.json({ success: true });
});

app.post('/api/drive/init', async (req, res) => {
  const tokenCookie = req.cookies.google_auth_tokens;
  if (!tokenCookie) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const tokens = JSON.parse(tokenCookie);
    const oauth2Client = getOAuth2Client(req);
    oauth2Client.setCredentials(tokens);

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Check if folder exists
    const response = await drive.files.list({
      q: "name = 'Zenith Studio' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
      fields: 'files(id, name)',
    });

    let folderId;
    if (response.data.files && response.data.files.length > 0) {
      folderId = response.data.files[0].id;
    } else {
      // Create folder
      const folderMetadata = {
        name: 'Zenith Studio',
        mimeType: 'application/vnd.google-apps.folder',
      };
      const folder = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id',
      });
      folderId = folder?.data?.id;
    }

    res.json({ folderId });
  } catch (error) {
    console.error('Drive API init error:', error);
    res.status(500).json({ error: 'Failed to initialize Drive folder' });
  }
});

app.get('/api/drive/search', async (req, res) => {
  const tokenCookie = req.cookies.google_auth_tokens;
  if (!tokenCookie) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const query = req.query.q as string || '';

  try {
    const tokens = JSON.parse(tokenCookie);
    const oauth2Client = getOAuth2Client(req);
    oauth2Client.setCredentials(tokens);

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const response = await drive.files.list({
      q: query ? `name contains '${query.replace(/'/g, "\\'")}' and trashed = false` : 'trashed = false',
      fields: 'files(id, name, mimeType, webViewLink, iconLink, modifiedTime)',
      pageSize: 15,
      orderBy: 'modifiedTime desc'
    });

    res.json({ files: response.data.files });
  } catch (error) {
    console.error('Drive API error:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
