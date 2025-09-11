// src/app/providers/CalculatorProvider.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CalculationHistory {
  id: string;
  expression: string;
  result: string;
  timestamp: Date;
}

interface CalculatorContextType {
  // Modal state
  isVisible: boolean;
  showCalculator: () => void;
  hideCalculator: () => void;
  
  // Calculator state
  display: string;
  expression: string;
  previousValue: string;
  operation: string | null;
  waitingForNewValue: boolean;
  
  // Calculator actions
  inputNumber: (num: string) => void;
  inputOperation: (op: string) => void;
  inputDecimal: () => void;
  calculate: () => void;
  clear: () => void;
  clearEntry: () => void;
  backspace: () => void;
  
  // History
  history: CalculationHistory[];
  clearHistory: () => void;
  setFromHistory: (result: string) => void;
}

const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

const STORAGE_KEY = 'calculator_history';

export const CalculatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Modal state
  const [isVisible, setIsVisible] = useState(false);
  
  // Calculator state
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [previousValue, setPreviousValue] = useState('');
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForNewValue, setWaitingForNewValue] = useState(false);
  
  // History state
  const [history, setHistory] = useState<CalculationHistory[]>([]);

  // Load history from storage on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const storedHistory = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        setHistory(parsedHistory);
      }
    } catch (error) {
      console.error('Failed to load calculator history:', error);
    }
  };

  const saveHistory = async (newHistory: CalculationHistory[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save calculator history:', error);
    }
  };

  const addToHistory = (expr: string, result: string) => {
    const newItem: CalculationHistory = {
      id: Date.now().toString(),
      expression: expr,
      result,
      timestamp: new Date(),
    };

    const newHistory = [newItem, ...history].slice(0, 50); // Keep last 50 calculations
    setHistory(newHistory);
    saveHistory(newHistory);
  };

  // Modal actions
  const showCalculator = () => setIsVisible(true);
  const hideCalculator = () => setIsVisible(false);

  // Calculator actions
  const inputNumber = (num: string) => {
    if (waitingForNewValue) {
      setDisplay(num);
      setWaitingForNewValue(false);
      setExpression(prev => prev + num);
    } else {
      const newDisplay = display === '0' ? num : display + num;
      setDisplay(newDisplay);
      setExpression(prev => prev + num);
    }
  };

  const inputOperation = (op: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === '') {
      setPreviousValue(String(inputValue));
      setExpression(display + ' ' + op + ' ');
    } else if (operation && !waitingForNewValue) {
      const currentValue = parseFloat(display);
      const prev = parseFloat(previousValue);
      let result = 0;

      switch (operation) {
        case '+':
          result = prev + currentValue;
          break;
        case '-':
          result = prev - currentValue;
          break;
        case '×':
          result = prev * currentValue;
          break;
        case '÷':
          result = currentValue !== 0 ? prev / currentValue : 0;
          break;
      }

      const resultStr = String(result);
      setDisplay(resultStr);
      setPreviousValue(resultStr);
      setExpression(prev => prev + ' = ' + resultStr + '\n' + resultStr + ' ' + op + ' ');
    }

    setWaitingForNewValue(true);
    setOperation(op);
  };

  const inputDecimal = () => {
    if (waitingForNewValue) {
      setDisplay('0.');
      setWaitingForNewValue(false);
      setExpression(prev => prev + '0.');
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
      setExpression(prev => prev + '.');
    }
  };

  const calculate = () => {
    if (operation && previousValue !== '' && !waitingForNewValue) {
      const currentValue = parseFloat(display);
      const prev = parseFloat(previousValue);
      let result = 0;

      switch (operation) {
        case '+':
          result = prev + currentValue;
          break;
        case '-':
          result = prev - currentValue;
          break;
        case '×':
          result = prev * currentValue;
          break;
        case '÷':
          result = currentValue !== 0 ? prev / currentValue : 0;
          break;
      }

      const resultStr = String(result);
      const finalExpression = expression + ' = ' + resultStr;
      
      setDisplay(resultStr);
      setExpression('');
      setPreviousValue('');
      setOperation(null);
      setWaitingForNewValue(true);

      // Add to history
      addToHistory(finalExpression, resultStr);
    }
  };

  const clear = () => {
    setDisplay('0');
    setExpression('');
    setPreviousValue('');
    setOperation(null);
    setWaitingForNewValue(false);
  };

  const clearEntry = () => {
    setDisplay('0');
  };

  const backspace = () => {
    if (display.length > 1 && display !== '0') {
      const newDisplay = display.slice(0, -1);
      setDisplay(newDisplay);
      setExpression(prev => prev.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const clearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  const setFromHistory = (result: string) => {
    setDisplay(result);
    setExpression(result);
    setPreviousValue('');
    setOperation(null);
    setWaitingForNewValue(true);
  };

  const value: CalculatorContextType = {
    // Modal state
    isVisible,
    showCalculator,
    hideCalculator,
    
    // Calculator state
    display,
    expression,
    previousValue,
    operation,
    waitingForNewValue,
    
    // Calculator actions
    inputNumber,
    inputOperation,
    inputDecimal,
    calculate,
    clear,
    clearEntry,
    backspace,
    
    // History
    history,
    clearHistory,
    setFromHistory,
  };

  return (
    <CalculatorContext.Provider value={value}>
      {children}
    </CalculatorContext.Provider>
  );
};

export const useCalculator = (): CalculatorContextType => {
  const context = useContext(CalculatorContext);
  if (!context) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
};