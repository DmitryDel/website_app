import { useState, useEffect, useCallback } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { FaPlus, FaSearch, FaTimes, FaSpinner } from 'react-icons/fa';
import { type FolderRead } from '../../types/folder';
import { type CardSetRead } from '../../types/set';
import { useDebounce } from '../../hooks/useDebounce';
import * as folderApi from '../../api/folderApi';
import * as setApi from '../../api/setApi';

import FolderItem from '../../components/library/FolderItem';
import SetItem from '../../components/library/SetItem';
import AddFolderModal from '../../components/library/AddFolderModal';
import EditFolderModal from '../../components/library/EditFolderModal';
import AddSetModal from '../../components/library/AddSetModal';
import EditSetModal from '../../components/library/EditSetModal';

const PAGE_SIZE = 20;

const LibraryPage = () => {
    // --- Состояния ---
    const [folders, setFolders] = useState<FolderRead[]>([]);
    const [sets, setSets] = useState<CardSetRead[]>([]);
    const [loadingFolders, setLoadingFolders] = useState(true);
    const [loadingSets, setLoadingSets] = useState(false);
    const [hasMoreFolders, setHasMoreFolders] = useState(true);
    const [hasMoreSets, setHasMoreSets] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 500);
    const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
    const [isAddFolderModalOpen, setIsAddFolderModalOpen] = useState(false);
    const [editingFolder, setEditingFolder] = useState<FolderRead | null>(null);
    const [isAddSetModalOpen, setIsAddSetModalOpen] = useState(false);
    const [editingSet, setEditingSet] = useState<CardSetRead | null>(null);

    // --- Загрузка данных ---
    const fetchFolders = useCallback(async (isSearch: boolean) => {
        if (!isSearch && loadingFolders) return;
        setLoadingFolders(true);
        const skip = isSearch ? 0 : folders.length;
        try {
            const newFolders = await folderApi.getFolders({ search: debouncedSearch, skip, limit: PAGE_SIZE });
            setFolders(prev => isSearch ? newFolders : [...prev, ...newFolders]);
            setHasMoreFolders(newFolders.length === PAGE_SIZE);
        } catch (error) { console.error("Failed to fetch folders:", error); }
        finally { setLoadingFolders(false); }
    }, [debouncedSearch, folders.length, loadingFolders]);

    const fetchSets = useCallback(async (isNewSelection: boolean) => {
        if (!selectedFolderId || (!isNewSelection && loadingSets)) return;
        setLoadingSets(true);
        const skip = isNewSelection ? 0 : sets.length;
        try {
            const newSets = await setApi.getSetsByFolder(selectedFolderId, { search: debouncedSearch, skip, limit: PAGE_SIZE });
            setSets(prev => isNewSelection ? newSets : [...prev, ...newSets]);
            setHasMoreSets(newSets.length === PAGE_SIZE);
        } catch (error) { console.error("Failed to fetch sets:", error); }
        finally { setLoadingSets(false); }
    }, [selectedFolderId, debouncedSearch, sets.length, loadingSets]);

    useEffect(() => { fetchFolders(true); }, [debouncedSearch]);
    useEffect(() => { if (selectedFolderId) fetchSets(true); else setSets([]); }, [selectedFolderId, debouncedSearch]);

    // --- CRUD-операции ---
    const handleAddFolder = async (name: string, is_public: boolean) => {
        const newFolder = await folderApi.createFolder({ name, is_public });
        setFolders(prev => [newFolder, ...prev]);
    };
    const handleUpdateFolder = async (id: number, name: string, is_public: boolean) => {
        const updatedFolder = await folderApi.updateFolder(id, { name, is_public });
        setFolders(prev => prev.map(f => f.id === id ? { ...f, ...updatedFolder } : f));
    };
    const handleDeleteFolder = async (folder: FolderRead) => {
        if (folder.set_count > 0) { alert("Cannot delete a folder that contains card sets."); return; }
        if (window.confirm(`Delete folder "${folder.name}"?`)) {
            await folderApi.deleteFolder(folder.id);
            setFolders(prev => prev.filter(f => f.id !== folder.id));
        }
    };
    const handleAddSet = async (payload: { name: string; description: string; is_public: boolean; tags: string[] }) => {
        if (!selectedFolderId) return;
        try {
            const newSet = await setApi.createSet(selectedFolderId, payload);
            setSets(prev => [newSet, ...prev]);
            setFolders(prev => prev.map(f => f.id === selectedFolderId ? {...f, set_count: f.set_count + 1} : f));
        } catch (error) {
            console.error("Failed to create set:", error);
            alert("Error creating set. See console for details.");
        }
    };

    const handleUpdateSet = async (id: number, payload: { name: string; description: string; is_public: boolean; tags: string[] }) => {
        const updatedSet = await setApi.updateSet(id, payload);
        setSets(prev => prev.map(s => s.id === id ? updatedSet : s));
    };

    const handleDeleteSet = async (cardSet: CardSetRead) => {
        if (window.confirm(`Delete set "${cardSet.name}"?`)) {
            await setApi.deleteSet(cardSet.id);
            setSets(prev => prev.filter(s => s.id !== cardSet.id));
            setFolders(prev => prev.map(f => f.id === selectedFolderId ? {...f, set_count: f.set_count - 1} : f)); // Обновляем счетчик
        }
    };

    return (
        <>
            <AddFolderModal isOpen={isAddFolderModalOpen} onClose={() => setIsAddFolderModalOpen(false)} onAddFolder={handleAddFolder} />
            <EditFolderModal isOpen={!!editingFolder} onClose={() => setEditingFolder(null)} folder={editingFolder} onUpdateFolder={handleUpdateFolder} />
            <AddSetModal isOpen={isAddSetModalOpen} onClose={() => setIsAddSetModalOpen(false)} onAddSet={handleAddSet} />
            <EditSetModal isOpen={!!editingSet} onClose={() => setEditingSet(null)} cardSet={editingSet} onUpdateSet={handleUpdateSet} />

            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="relative mb-8">
                    <input type="text" placeholder="Search for folders and card sets" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    {searchQuery && <FaTimes onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" />}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 md:gap-8">
                    <section className="md:border-r md:pr-8 border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Folders</h2>
                            <button onClick={() => setIsAddFolderModalOpen(true)} className="p-2 text-indigo-600 rounded-full hover:bg-indigo-100"><FaPlus className="w-5 h-5" /></button>
                        </div>
                        <div id="folderScrollableDiv" className="h-[60vh] overflow-auto">
                            <InfiniteScroll dataLength={folders.length} next={() => fetchFolders(false)} hasMore={hasMoreFolders} scrollableTarget="folderScrollableDiv"
                                loader={<div className="flex justify-center py-4"><FaSpinner className="animate-spin text-indigo-600" /></div>}
                                endMessage={<p className="text-center text-sm text-gray-500 py-4">No more folders.</p>}>
                                <div className="space-y-2">
                                    {folders.map(folder => <FolderItem key={folder.id} folder={folder} isActive={selectedFolderId === folder.id} onClick={() => setSelectedFolderId(folder.id)} onEdit={setEditingFolder} onDelete={handleDeleteFolder} />)}
                                </div>
                            </InfiniteScroll>
                        </div>
                    </section>

                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Flashcard Sets</h2>
                            <button onClick={() => setIsAddSetModalOpen(true)} disabled={!selectedFolderId} className="p-2 text-indigo-600 rounded-full hover:bg-indigo-100 disabled:text-gray-300 disabled:cursor-not-allowed"><FaPlus className="w-5 h-5" /></button>
                        </div>
                        <div id="setScrollableDiv" className="h-[60vh] overflow-auto">
                           <InfiniteScroll dataLength={sets.length} next={() => fetchSets(false)} hasMore={hasMoreSets} scrollableTarget="setScrollableDiv"
                                loader={<div className="flex justify-center py-4"><FaSpinner className="animate-spin text-indigo-600" /></div>}
                                endMessage={<p className="text-center text-sm text-gray-500 py-4">No more sets.</p>}>
                                <div className="space-y-2">
                                    {loadingSets && sets.length === 0 ? <div className="flex justify-center py-4"><FaSpinner className="animate-spin text-indigo-600" /></div> :
                                     !selectedFolderId ? <p className="text-center text-gray-500 mt-10">Select a folder to see card sets.</p> :
                                     sets.length === 0 ? <p className="text-center text-gray-500 mt-10">No card sets found.</p> :
                                     sets.map(set => <SetItem key={set.id} cardSet={set} onEdit={setEditingSet} onDelete={handleDeleteSet} />)
                                    }
                                </div>
                            </InfiniteScroll>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
};

export default LibraryPage;