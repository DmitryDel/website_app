// import React from 'react';
import { useAuthStore } from '../../store/useAuthStore'; // <-- Импортируем хранилище

const Footer = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <footer className="bg-white w-full border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">

        {/* Показываем этот блок только залогиненным пользователям */}
        {isAuthenticated && (
          <div className="mb-6">
              <h3 className="font-semibold text-gray-700">Support The Project</h3>
              <p className="mt-2">If you find this app useful, consider making a donation. It helps to keep the project alive!</p>
            {/* Позже здесь будет кнопка Robokassa */}
            <button className="mt-3 px-4 py-2 bg-yellow-400 text-black rounded-md font-bold hover:bg-yellow-500">
              Donate
            </button>
          </div>
        )}

        <p>&copy; {new Date().getFullYear()} FlashcardsApp. Все права защищены.</p>
      </div>
    </footer>
  );
};

export default Footer;