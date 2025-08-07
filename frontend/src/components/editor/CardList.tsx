import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type {CardRead} from '../../types/card';
import EditableCard from './EditableCard';

interface CardListProps {
  cards: CardRead[];
  setCards: React.Dispatch<React.SetStateAction<CardRead[]>>;
  onReorder: (reorderedCards: CardRead[]) => void;
  onUpdateCard: (cardId: number, data: any) => void;
  onDeleteCard: (cardId: number) => void;
}

const CardList: React.FC<CardListProps> = ({ cards, setCards, onReorder, onUpdateCard, onDeleteCard }) => {
  // Настройка сенсоров для dnd-kit (для мыши и клавиатуры)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Обработчик завершения перетаскивания
  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = cards.findIndex(c => c.id === active.id);
      const newIndex = cards.findIndex(c => c.id === over.id);
      const reorderedCards = arrayMove(cards, oldIndex, newIndex);

      // 1. Оптимистично обновляем UI
      setCards(reorderedCards);
      // 2. Вызываем функцию для отправки нового порядка на сервер
      onReorder(reorderedCards);
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={cards} strategy={verticalListSortingStrategy}>
        <div>
          {cards.map((card, index) => (
            <EditableCard
              key={card.id}
              card={card}
              index={index}
              onUpdate={onUpdateCard}
              onDelete={onDeleteCard}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default CardList;