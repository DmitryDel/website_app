// import React from 'react';
import { FaFire } from 'react-icons/fa';

// Временные данные, которые потом будут приходить с бэкенда
const mockRecentDecks = [
  { id: 1, title: 'IT English for Beginners', cardCount: 50, lastPracticed: 'Today' },
  { id: 2, title: 'Travel Phrases', cardCount: 30, lastPracticed: 'Yesterday' },
  { id: 3, title: 'Advanced Phrasal Verbs', cardCount: 120, lastPracticed: '3 days ago' },
];

const HomePageUser = () => {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Приветственный блок */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
          <p className="text-md text-gray-500 mt-1">Registered since: June 24, 2025</p>
        </div>
        <div className="flex items-center space-x-3 bg-orange-100 text-orange-600 font-bold p-3 rounded-lg">
          <FaFire className="w-6 h-6 text-orange-500" />
          <span className="text-xl">5</span>
          <span className="text-sm">days streak!</span>
        </div>
      </div>

      {/* Блок с недавними наборами */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Decks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockRecentDecks.map((deck) => (
            // Карточка для одного набора
            <div key={deck.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer">
              <h3 className="text-lg font-bold text-indigo-700">{deck.title}</h3>
              <p className="text-sm text-gray-500 mt-2">{deck.cardCount} cards</p>
              <p className="text-xs text-gray-400 mt-4">Last practiced: {deck.lastPracticed}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePageUser;