// src/hooks/useHistory.js
import { useState } from 'react';

export const useHistory = (initialState) => {
  const [history, setHistory] = useState([initialState]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const addToHistory = (newState) => {
    setHistory([...history.slice(0, historyIndex + 1), newState]);
    setHistoryIndex(historyIndex + 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      return history[historyIndex - 1];
    }
    return null;
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      return history[historyIndex + 1];
    }
    return null;
  };

  return {
    addToHistory,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1
  };
};