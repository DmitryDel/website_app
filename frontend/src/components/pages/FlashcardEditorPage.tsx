import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type {CardSetRead} from '../../types/set';
import type {CardRead} from '../../types/card';
import * as setApi from '../../api/setApi';
import * as cardApi from '../../api/cardApi';
import { useAuthStore } from '../../store/useAuthStore';

import EditorHeader from '../../components/editor/EditorHeader';
import SetDetails from '../../components/editor/SetDetails';
import CardList from '../../components/editor/CardList';
import { FaSpinner } from 'react-icons/fa';

const FlashcardEditorPage = () => {
  const { setId } = useParams<{ setId: string }>();
  const navigate = useNavigate();
  const { token, isHydrated } = useAuthStore(state => ({
    token: state.token,
    isHydrated: state.isHydrated
  }));

  // Состояния для данных
  const [cardSet, setCardSet] = useState<CardSetRead | null>(null);
  const [cards, setCards] = useState<CardRead[]>([]);

  // Состояния UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Состояния для редактируемых полей метаданных
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');

  // --- Загрузка данных ---
  useEffect(() => {
    // 1. Ничего не делаем, пока состояние не загрузилось из localStorage
    if (!isHydrated) {
      return;
    }

    // 2. Теперь эта проверка надежна. Если токена нет, перенаправляем.
    if (!token) {
      navigate('/login');
      return;
    }

    // 3. Если все в порядке, загружаем данные
    if (!setId) {
      navigate('/library');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const setDetails = await setApi.getSetById(Number(setId));
        setCardSet(setDetails);
        setName(setDetails.name);
        setDescription(setDetails.description || '');
        setTags(setDetails.tags.map(t => t.name).join(', '));

        // TODO: Реализовать пагинацию, если card_count > 100
        const cardData = await cardApi.getCardsBySet(Number(setId), {});
        setCards(cardData);
      } catch (err) {
        setError("Failed to load card set. You may not have permission to view it.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setId, navigate, token, isHydrated]);

  // --- Обработчики CRUD ---
  const handleUpdateCard = useCallback(async (cardId: number, data: any) => {
    setSaveStatus('saving');
    try {
      await cardApi.updateCard(cardId, data);
      setSaveStatus('saved');
    } catch (err) {
      console.error("Autosave failed:", err);
      setSaveStatus('idle');
    }
  }, []);

  const handleDeleteCard = async (cardId: number) => {
    setCards(prev => prev.filter(c => c.id !== cardId));
    await cardApi.deleteCard(cardId);
  };

  const handleAddCard = async () => {
    if (!setId) return;
    const newCard = await cardApi.createCard(Number(setId), { term: '', definition: '' });
    setCards(prev => [...prev, newCard]);
  };

  const handleReorderCards = useCallback(async (reorderedCards: CardRead[]) => {
    const cardIds = reorderedCards.map(c => c.id);
    await cardApi.reorderCards(Number(setId), { card_ids: cardIds });
  }, [setId]);

  const handleSaveSet = async () => {
    if (!setId) return;
    setSaveStatus('saving');
    const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    const payload = {
      name,
      description,
      is_public: cardSet?.is_public ?? false,
      tags: tagsArray
    };
    await setApi.updateSet(Number(setId), payload);
    setSaveStatus('saved');
  };

  const handleDeleteAllCards = async () => {
    if (window.confirm("Are you sure you want to delete ALL cards in this set? This action cannot be undone.")) {
      await cardApi.deleteAllCards(Number(setId));
      setCards([]);
    }
  };

  // --- ИСПРАВЛЕНИЕ ---
  // Добавляем проверку на гидратацию перед основным рендерингом
  if (!isHydrated || (loading && !error)) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin text-4xl text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-20">
        {error}
      </div>
    );
  }

  return (
    <>
      <EditorHeader
        onSave={handleSaveSet}
        onDeleteAll={handleDeleteAllCards}
        saveStatus={saveStatus}
      />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <SetDetails
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          tags={tags}
          setTags={setTags}
        />
        <CardList
          cards={cards}
          setCards={setCards}
          onReorder={handleReorderCards}
          onUpdateCard={handleUpdateCard}
          onDeleteCard={handleDeleteCard}
        />
        <div className="text-center mt-8">
          <button
            onClick={handleAddCard}
            className="px-6 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 font-semibold"
          >
            Add a card
          </button>
        </div>
      </div>
    </>
  );
};

export default FlashcardEditorPage;