import React, { useState, useEffect, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type {CardRead} from '../../types/card';
import { useDebounce } from '../../hooks/useDebounce';
import { FaGripLines, FaTrash } from 'react-icons/fa';

interface EditableCardProps {
  card: CardRead;
  index: number;
  onUpdate: (cardId: number, data: any) => void;
  onDelete: (cardId: number) => void;
}

const EditableCard: React.FC<EditableCardProps> = ({ card, index, onUpdate, onDelete }) => {
  const [term, setTerm] = useState(card.term);
  const [definition, setDefinition] = useState(card.definition);
  // ... состояния для других полей ...

  const debouncedTerm = useDebounce(term, 1500); // Задержка 1.5 секунды для автосохранения
  const debouncedDefinition = useDebounce(definition, 1500);

  // Логика Drag-and-Drop из dnd-kit
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: card.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  // Эффект для автосохранения при изменении данных
  useEffect(() => {
    // Сравниваем с исходными данными, чтобы не отправлять лишние запросы
    if (debouncedTerm !== card.term || debouncedDefinition !== card.definition) {
      onUpdate(card.id, { term: debouncedTerm, definition: debouncedDefinition });
    }
  }, [debouncedTerm, debouncedDefinition, card.id, card.term, card.definition, onUpdate]);

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-lg shadow-md mb-4 touch-none">
      {/* Верхняя панель карточки */}
      <div className="flex items-center justify-between bg-gray-50 p-2 rounded-t-lg border-b">
        <span className="text-lg font-bold text-gray-500">{index + 1}</span>
        <div className="flex items-center space-x-2">
          <button {...attributes} {...listeners} className="cursor-grab p-2 text-gray-400 hover:text-gray-700">
            <FaGripLines />
          </button>
          <button onClick={() => onDelete(card.id)} className="p-2 text-gray-400 hover:text-red-600">
            <FaTrash />
          </button>
        </div>
      </div>

      {/* Редактируемые поля */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Term" className="w-full p-2 border rounded resize-none"/>
        <textarea value={definition} onChange={(e) => setDefinition(e.target.value)} placeholder="Definition" className="w-full p-2 border rounded resize-none"/>
        {/* ... другие поля (example, translation) ... */}
      </div>
    </div>
  );
};

export default EditableCard;