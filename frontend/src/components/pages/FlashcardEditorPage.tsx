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
    const { token, isHydrated } = useAuthStore(state => ({ token: state.token, isHydrated: state.isHydrated }));

    // States for data
    const [cardSet, setCardSet] = useState<CardSetRead | null>(null);
    const [cards, setCards] = useState<CardRead[]>([]);

    // States for UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

    // States for editable set metadata
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');

    // --- Data Fetching Effect ---
    useEffect(() => {
        if (!isHydrated) return;
        if (!token) { navigate('/login'); return; }
        if (!setId) { navigate('/library'); return; }

        const fetchData = async () => {
            try {
                setLoading(true);
                const setDetails = await setApi.getSetById(Number(setId));
                if (setDetails) {
                    setCardSet(setDetails);
                    setName(setDetails.name);
                    setDescription(setDetails.description || '');
                    setTags(setDetails.tags.map(t => t.name).join(', '));

                    // TODO: Implement pagination if setDetails.card_count > 100
                    const cardData = await cardApi.getCardsBySet(Number(setId), {});
                    setCards(cardData);
                } else {
                    throw new Error("Card set not found.");
                }
            } catch (err) {
                setError("Failed to load card set. You may not have permission to view it.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [setId, navigate, token, isHydrated]);

    // --- CRUD Handlers ---
    const handleSaveSet = async () => {
        if (!setId) return;
        setSaveStatus('saving');
        try {
            const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
            const payload = { name, description, is_public: cardSet?.is_public ?? false, tags: tagsArray };
            await setApi.updateSet(Number(setId), payload);
            setSaveStatus('saved');
        } catch (error) {
            console.error("Failed to save set details:", error);
            setSaveStatus('idle');
        }
    };

    const handleDeleteAllCards = async () => {
        if (window.confirm("Are you sure you want to delete ALL cards in this set? This action cannot be undone.")) {
            if (!setId) return;
            try {
                await cardApi.deleteAllCards(Number(setId));
                setCards([]);
            } catch (error) {
                console.error("Failed to delete all cards:", error);
                alert("Could not delete cards. Please try again.");
            }
        }
    };

    const handleAddCard = async () => {
        if (!setId) return;
        try {
            const newCard = await cardApi.createCard(Number(setId), { term: 'New Term', definition: 'New Definition' });
            setCards(prev => [...prev, newCard]);
        } catch (error) {
            console.error("Failed to add card:", error);
        }
    };

    const handleUpdateCard = useCallback(async (cardId: number, data: any) => {
        setSaveStatus('saving');
        try {
            await cardApi.updateCard(cardId, data);
            setSaveStatus('saved');
        } catch (err) {
            console.error("Autosave failed for card:", cardId, err);
            setSaveStatus('idle');
        }
    }, []);

    const handleDeleteCard = async (cardId: number) => {
        try {
            await cardApi.deleteCard(cardId);
            setCards(prev => prev.filter(c => c.id !== cardId));
        } catch (error) {
            console.error("Failed to delete card:", cardId, error);
        }
    };

    const handleReorderCards = useCallback(async (reorderedCards: CardRead[]) => {
        if (!setId) return;
        setSaveStatus('saving');
        try {
            const cardIds = reorderedCards.map(c => c.id);
            await cardApi.reorderCards(Number(setId), { card_ids: cardIds });
            setSaveStatus('saved');
        } catch (error) {
            console.error("Failed to reorder cards:", error);
            setSaveStatus('idle');
        }
    }, [setId]);

    // --- Render Logic ---
    if (loading) {
        return <div className="flex justify-center items-center h-screen"><FaSpinner className="animate-spin text-4xl text-indigo-600" /></div>;
    }

    if (error) {
        return <div className="text-center text-red-500 mt-20">{error}</div>;
    }

    return (
        <>
            <EditorHeader onSave={handleSaveSet} onDeleteAll={handleDeleteAllCards} saveStatus={saveStatus} />
            <main className="max-w-4xl mx-auto px-4 py-8">
                {cardSet && (
                    <>
                        <SetDetails
                            name={name} setName={setName}
                            description={description} setDescription={setDescription}
                            tags={tags} setTags={setTags}
                        />
                        <CardList
                            cards={cards}
                            setCards={setCards}
                            onReorder={handleReorderCards}
                            onUpdateCard={handleUpdateCard}
                            onDeleteCard={handleDeleteCard}
                        />
                        <div className="text-center mt-8">
                            <button onClick={handleAddCard} className="px-6 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 font-semibold">
                                Add a card
                            </button>
                        </div>
                    </>
                )}
            </main>
        </>
    );
};

export default FlashcardEditorPage;