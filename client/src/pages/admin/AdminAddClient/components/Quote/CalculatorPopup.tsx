import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, Minus } from 'lucide-react';

interface CalculatorPopupProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  onPositionChange: (position: { x: number; y: number }) => void;
}

const CalculatorPopup = ({
  isOpen,
  onClose,
  position,
  onPositionChange
}: CalculatorPopupProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState('');
  const [operator, setOperator] = useState('');

  if (!isOpen) return null;

  const handleButtonClick = (btn: string) => {
    if (btn === 'C') {
      setDisplay('0');
      setMemory('');
      setOperator('');
    } else if (btn === '=') {
      if (memory && operator) {
        const prev = parseFloat(memory);
        const current = parseFloat(display);
        let result = 0;
        switch (operator) {
          case '+': result = prev + current; break;
          case '-': result = prev - current; break;
          case '*': result = prev * current; break;
          case '/': result = prev / current; break;
        }
        setDisplay(result.toString());
        setMemory('');
        setOperator('');
      }
    } else if (['+', '-', '*', '/'].includes(btn)) {
      setMemory(display);
      setOperator(btn);
      setDisplay('0');
    } else {
      setDisplay(display === '0' ? btn : display + btn);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 1000,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).closest('.calculator-body')) return;
        setIsDragging(true);
        setDragOffset({
          x: e.clientX - position.x,
          y: e.clientY - position.y
        });
      }}
      onMouseMove={(e) => {
        if (isDragging) {
          onPositionChange({
            x: e.clientX - dragOffset.x,
            y: e.clientY - dragOffset.y
          });
        }
      }}
      onMouseUp={() => setIsDragging(false)}
      onMouseLeave={() => setIsDragging(false)}
    >
      <Card className="w-80 shadow-2xl border-2 border-primary/20">
        <CardHeader className="pb-3 bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base font-bold text-white flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Calculator
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0 text-white hover:bg-white/20"
              data-testid="button-close-calculator"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="calculator-body pt-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-4 rounded-lg mb-4 text-right font-mono text-2xl font-bold text-green-400 shadow-inner border border-slate-700">
            {display}
          </div>
          <div className="grid grid-cols-4 gap-3">
            {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', 'C', '0', '=', '+'].map((btn) => (
              <Button
                key={btn}
                variant={btn === '=' ? 'default' : 'outline'}
                size="default"
                onClick={() => handleButtonClick(btn)}
                className={`h-14 text-lg font-semibold ${
                  btn === 'C' ? 'bg-red-500 hover:bg-red-600 text-white border-red-600' :
                  btn === '=' ? 'bg-green-500 hover:bg-green-600 text-white border-green-600' :
                  ['+', '-', '*', '/'].includes(btn) ? 'bg-blue-500 hover:bg-blue-600 text-white border-blue-600' :
                  ''
                }`}
                data-testid={`calculator-btn-${btn}`}
              >
                {btn}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalculatorPopup;
