'use client';

import { useState, createContext, useContext, ReactNode } from 'react';

interface DateContextType {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

export function DateProvider({ children }: { children: ReactNode }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const goToPrevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  return (
    <DateContext.Provider
      value={{ currentDate, setCurrentDate, goToPrevMonth, goToNextMonth }}
    >
      {children}
    </DateContext.Provider>
  );
}

export function useDate() {
  const context = useContext(DateContext);
  if (!context) {
    throw new Error('useDate must be used within a DateProvider');
  }
  return context;
}
