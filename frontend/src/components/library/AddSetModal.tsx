import React, { useState } from 'react';
import Modal from '../common/Modal';

interface AddSetPayload {
  name: string;
  description: string;
  is_public: boolean;
  tags: string[];
}

interface AddSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSet: (payload: AddSetPayload) => void;
}

const AddSetModal: React.FC<AddSetModalProps> = ({ isOpen, onClose, onAddSet }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);

      onAddSet({
        name: name.trim(),
        description: description.trim(),
        is_public: isPublic,
        tags: tagsArray
      });

      setName('');
      setDescription('');
      setIsPublic(false);
      setTags('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Card Set">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" rows={3}></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
          <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"/>
        </div>
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
          <span>Public Set</span>
        </label>
        <div className="mt-4 flex justify-end">
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Create</button>
        </div>
      </form>
    </Modal>
  );
};

export default AddSetModal;