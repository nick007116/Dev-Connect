import React from 'react';
import UserSearch from './UserSearch';
import { ArrowLeft } from 'lucide-react';

const SearchWindow = ({ currentUser, onSelectUser, onClose }) => {
  return (
    <div className="fixed inset-0 bg-white z-[10000]">
      {/* Header with Back Button */}
      <div className="p-4 border-b border-gray-200 flex items-center">
        <button onClick={onClose} className="mr-4">
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h2 className="text-lg font-semibold">Search Users</h2>
      </div>

      {/* User Search Component */}
      <div className="p-4">
        <UserSearch currentUser={currentUser} onSelectUser={onSelectUser} />
      </div>
    </div>
  );
};

export default SearchWindow;