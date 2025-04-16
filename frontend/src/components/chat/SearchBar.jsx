import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, ArrowUp, ArrowDown } from 'lucide-react';

const SearchBar = ({ isActive, onClose, messages, onHighlight }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [matches, setMatches] = useState([]);
  const [currentMatch, setCurrentMatch] = useState(-1);

  const performSearch = useCallback(() => {
    if (!searchTerm.trim()) {
      setMatches([]);
      setCurrentMatch(-1);
      onHighlight([], -1);
      return;
    }

    const newMatches = messages.reduce((acc, message, messageIndex) => {
      const regex = new RegExp(searchTerm, 'gi');
      let match;
      while ((match = regex.exec(message.text)) !== null) {
        acc.push({
          messageIndex,
          matchIndex: match.index,
          text: match[0]
        });
      }
      return acc;
    }, []);

    setMatches(newMatches);
    setCurrentMatch(newMatches.length > 0 ? 0 : -1);
    onHighlight(newMatches, newMatches.length > 0 ? 0 : -1);
  }, [searchTerm, messages, onHighlight]);

  useEffect(() => {
    const handler = setTimeout(performSearch, 300);
    return () => clearTimeout(handler);
  }, [searchTerm, performSearch]);

  const navigateMatch = (direction) => {
    const newIndex = direction === 'up'
      ? (currentMatch - 1 + matches.length) % matches.length
      : (currentMatch + 1) % matches.length;
    setCurrentMatch(newIndex);
    onHighlight(matches, newIndex);
  };

  if (!isActive) return null;

  return (
    <div className="absolute top-16 right-5 z-20 flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center px-3 py-2">
        <Search size={16} className="text-gray-400 mr-2" />
        <input
          autoFocus
          className="bg-transparent w-48 text-sm focus:outline-none dark:text-white"
          placeholder="Search in chat..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') navigateMatch('down');
            if (e.key === 'Escape') onClose();
          }}
        />
      </div>
      
      <div className="flex items-center border-l border-gray-200 dark:border-gray-700 pl-2 pr-3">
        <span className="text-xs text-gray-500 mr-2">
          {matches.length > 0 ? `${currentMatch + 1}/${matches.length}` : '0/0'}
        </span>
        <button
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
          onClick={() => navigateMatch('up')}
          disabled={matches.length === 0}
        >
          <ArrowUp size={16} className="text-gray-400" />
        </button>
        <button
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-50"
          onClick={() => navigateMatch('down')}
          disabled={matches.length === 0}
        >
          <ArrowDown size={16} className="text-gray-400" />
        </button>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded ml-1"
        >
          <X size={16} className="text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;