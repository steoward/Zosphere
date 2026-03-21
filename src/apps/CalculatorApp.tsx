import { useState } from 'react';

export function CalculatorApp() {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [evaluated, setEvaluated] = useState(false);

  const handleNumber = (num: string) => {
    if (evaluated) {
      setDisplay(num);
      setExpression(num);
      setEvaluated(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
      setExpression(expression + num);
    }
  };

  const handleOperator = (op: string) => {
    if (evaluated) {
      setExpression(display + op);
      setDisplay('0');
      setEvaluated(false);
    } else {
      // If the last character is an operator, replace it
      if (/[+\-*/]$/.test(expression)) {
        setExpression(expression.slice(0, -1) + op);
      } else {
        setExpression(expression + op);
      }
      setDisplay('0');
    }
  };

  const handleEqual = () => {
    try {
      // Safe evaluation using Function
      const result = new Function('return ' + expression)();
      // Format to avoid long decimals
      const formattedResult = Number.isInteger(result) ? result : parseFloat(result.toFixed(8));
      setDisplay(String(formattedResult));
      setExpression(String(formattedResult));
      setEvaluated(true);
    } catch (e) {
      setDisplay('Error');
      setExpression('');
      setEvaluated(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setExpression('');
    setEvaluated(false);
  };

  const handleDecimal = () => {
    if (evaluated) {
      setDisplay('0.');
      setExpression('0.');
      setEvaluated(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
      setExpression(expression + '.');
    }
  };

  const buttons = [
    ['C', '±', '%', '/'],
    ['7', '8', '9', '*'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '=']
  ];

  return (
    <div className="w-full h-full flex flex-col p-4 text-white bg-white/5 backdrop-blur-xl rounded-2xl">
      <div className="flex-1 flex flex-col items-end justify-end p-4 mb-4 bg-white/10 rounded-2xl border border-white/20 shadow-inner">
        <div className="text-white/50 text-sm h-6 tracking-widest" dir="ltr">
          {expression}
        </div>
        <div className="text-4xl font-light tracking-wider truncate w-full text-right" dir="ltr">
          {display}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {buttons.flat().map((btn, i) => (
          <button
            key={i}
            onClick={() => {
              if (btn === 'C') clear();
              else if (btn === '=') handleEqual();
              else if (btn === '.') handleDecimal();
              else if (['+', '-', '*', '/'].includes(btn)) handleOperator(btn);
              else if (btn === '±') {
                const val = String(parseFloat(display) * -1);
                setDisplay(val);
                // Simple replacement for expression, might not be perfect for complex ones
                setExpression(val);
              }
              else if (btn === '%') {
                const val = String(parseFloat(display) / 100);
                setDisplay(val);
                setExpression(val);
              }
              else handleNumber(btn);
            }}
            className={`p-4 rounded-2xl text-xl font-medium transition-all duration-200 shadow-lg backdrop-blur-md
              ${btn === '=' ? 'col-span-2 bg-blue-500/50 hover:bg-blue-500/70 border border-blue-400/50' : 
                ['+', '-', '*', '/'].includes(btn) ? 'bg-white/20 hover:bg-white/30 border border-white/30' : 
                'bg-white/10 hover:bg-white/20 border border-white/20'}`}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
}
