import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import {type FolderRead } from "../../types/folder.ts";

interface EditFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder: FolderRead | null;
  onUpdateFolder: (id: number, name: string, is_public: boolean) => void;
}

const EditFolderModal: React.FC<EditFolderModalProps> = ({ isOpen, onClose, folder, onUpdateFolder }) => {
  const [name, setName] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    // Заполняем форму данными папки, когда она передается в модальное окно
    if (folder) {
      setName(folder.name);
      setIsPublic(folder.is_public);
    }
  }, [folder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (folder && name.trim()) {
      onUpdateFolder(folder.id, name.trim(), isPublic);
      onClose();
    }
  };

  if (!folder) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Folder: ${folder.name}`}>
      <form onSubmit={handleSubmit}>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"/>
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
          <span>Public</span>
        </label>
        <div className="mt-4 flex justify-end">
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Update</button>
        </div>
      </form>
    </Modal>
  );
};

export default EditFolderModal;