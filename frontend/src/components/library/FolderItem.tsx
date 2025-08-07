import React, { useState, useRef } from 'react'; // <-- Импортируем useRef
import { FaFolder, FaEllipsisV } from 'react-icons/fa';
import DropdownMenu from '../common/DropdownMenu';
import { useClickOutside } from '../../hooks/useClickOutside'; // <-- Импортируем наш хук
import { type FolderRead } from '../../types/folder'; // <-- Используем новый тип

interface FolderItemProps {
  folder: FolderRead; // <-- Тип изменен
  isActive: boolean;
  onClick: () => void;
  onEdit: (folder: FolderRead) => void; // <-- Передаем весь объект
  onDelete: (folder: FolderRead) => void; // <-- Передаем весь объект
}

const FolderItem: React.FC<FolderItemProps> = ({ folder, isActive, onClick, onEdit, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null); // <-- Создаем ref для меню

  // --- НОВАЯ ФИЧА: Используем хук для закрытия меню ---
  useClickOutside(menuRef, () => setMenuOpen(false));

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${isActive ? 'bg-indigo-100' : 'hover:bg-gray-100'}`} onClick={onClick}>
      <div className="flex items-center space-x-3">
        <FaFolder className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`} />
        <span className="font-medium text-gray-800">{folder.name}</span>
      </div>
      {/* Оборачиваем кнопку и меню в div и передаем ему ref */}
      <div className="relative" ref={menuRef}>
        <button onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }} className="p-2 rounded-full hover:bg-gray-200">
          <FaEllipsisV className="text-gray-500" />
        </button>
        {/*{menuOpen && <DropdownMenu onEdit={() => alert('Edit folder!')} onDelete={onDelete} />}*/}
        {menuOpen && <DropdownMenu onEdit={() => onEdit(folder)} onDelete={() => onDelete(folder)} />}
      </div>
    </div>
  );
};

export default FolderItem;