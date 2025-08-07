import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { type CardSetRead } from '../../types/set';

interface EditSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardSet: CardSetRead | null;
  onUpdateSet: (id: number, payload: { name: string; description: string; is_public: boolean; tags: string[] }) => void;
}

const EditSetModal: React.FC<EditSetModalProps> = ({ isOpen, onClose, cardSet, onUpdateSet }) => {
  // Состояния для полей формы
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState(''); // Теги будем редактировать как строку через запятую для простоты

  // Этот эффект заполняет форму данными, когда модальное окно открывается
  useEffect(() => {
    if (cardSet) {
      setName(cardSet.name);
      setDescription(cardSet.description || '');
      setIsPublic(cardSet.is_public);
      setTags(cardSet.tags.map(t => t.name).join(', '));
    }
  }, [cardSet]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardSet && name.trim()) {
      // Преобразуем строку тегов обратно в массив
      const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      onUpdateSet(cardSet.id, { name: name.trim(), description: description.trim(), is_public: isPublic, tags: tagsArray });
      onClose();
    }
  };

  // Не рендерим ничего, если нет выбранного набора
  if (!cardSet) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Set: ${cardSet.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" rows={3}></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
          <input type="text" value={tags} onChange={(e) => setTags(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"/>
        </div>
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
          <span>Public Set</span>
        </label>
        <div className="mt-4 flex justify-end">
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            Update Set
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditSetModal;