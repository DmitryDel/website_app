import React from 'react';

interface DropdownMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ onEdit, onDelete }) => {
  return (
    <div className="absolute top-8 right-0 w-32 bg-white rounded-md shadow-lg z-10 border">
      <ul className="py-1">
        <li>
          <button onClick={onEdit} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Edit
          </button>
        </li>
        <li>
          <button onClick={onDelete} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
            Delete
          </button>
        </li>
      </ul>
    </div>
  );
};

export default DropdownMenu;