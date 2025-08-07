import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { type CardSetRead } from '../../types/set';
import { FaLayerGroup, FaEllipsisV } from 'react-icons/fa';
import DropdownMenu from '../common/DropdownMenu';
import { useClickOutside } from '../../hooks/useClickOutside';

interface SetItemProps {
  cardSet: CardSetRead;
  onEdit: (cardSet: CardSetRead) => void;
  onDelete: (cardSet: CardSetRead) => void;
}

const SetItem: React.FC<SetItemProps> = ({ cardSet, onEdit, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useClickOutside(menuRef, () => setMenuOpen(false));

  const stopPropagation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    stopPropagation(e);
    setMenuOpen(prev => !prev);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    stopPropagation(e);
    onEdit(cardSet);
    setMenuOpen(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    stopPropagation(e);
    onDelete(cardSet);
    setMenuOpen(false);
  };

  return (
    <Link to={`/set/${cardSet.id}/edit`} className="block p-3 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 overflow-hidden">
          <FaLayerGroup className="w-5 h-5 text-gray-500 flex-shrink-0" />
          <div className="overflow-hidden">
            <p className="font-medium text-gray-800 truncate">{cardSet.name}</p>
            <p className="text-sm text-gray-500 truncate">{cardSet.description || 'No description'}</p>
          </div>
        </div>
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button onClick={handleMenuToggle} className="p-2 rounded-full hover:bg-gray-200">
            <FaEllipsisV className="text-gray-500" />
          </button>
          {menuOpen && <DropdownMenu onEdit={handleEditClick} onDelete={handleDeleteClick} />}
        </div>
      </div>
    </Link>
  );
};

export default SetItem;