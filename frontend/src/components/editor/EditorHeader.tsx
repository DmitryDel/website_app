import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaTrash, FaPlay } from 'react-icons/fa';

interface EditorHeaderProps {
  onSave: () => void;
  onDeleteAll: () => void;
  saveStatus: 'idle' | 'saving' | 'saved';
}

const EditorHeader: React.FC<EditorHeaderProps> = ({ onSave, onDeleteAll, saveStatus }) => {
  const getStatusText = () => {
    switch (saveStatus) {
      case 'saving': return 'Saving...';
      case 'saved': return 'Saved ✔';
      default: return '';
    }
  };

  return (
    <div className="sticky top-16 bg-gray-50 z-20 shadow-sm py-3 px-4 mb-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/library" className="flex items-center space-x-2 px-4 py-2 rounded-md hover:bg-gray-200">
            <FaArrowLeft />
            <span>Back to library</span>
          </Link>
          <button onClick={onSave} className="flex items-center space-x-2 px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
            <FaSave />
            <span>Save set</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600">
            <FaPlay />
            <span>Save and Practice</span>
          </button>
          <button onClick={onDeleteAll} className="flex items-center space-x-2 px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600">
            <FaTrash />
            <span>Delete all cards</span>
          </button>
        </div>

        {/* Индикатор автосохранения */}
        <div className="text-sm text-gray-500 font-medium min-w-[100px] text-right">
          {getStatusText()}
        </div>

        {/* TODO: Поиск по карточкам */}
      </div>
    </div>
  );
};

export default EditorHeader;