// import React from 'react';
import { useTranslation } from 'react-i18next';
import RotatingCard from "../common/RotatingCard.tsx"; // изменил путь вручную
import { Link } from 'react-router-dom';

const HomePage = () => {
  const { t } = useTranslation();

  return (
    // Этот div будет нашим контейнером для контента с ограничением по ширине и отступами
    // <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center py-16 md:py-24">
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center py-16 md:py-24">
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-8">
        {t('hero.title')}
      </h1>

      <div className="mb-12">
        <RotatingCard
          frontText={t('hero.cardFront')}
          backText={t('hero.cardBack')}
        />
      </div>

      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <Link
          to="/login"
          className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          {t('nav.login')}
        </Link>
        <Link
          to="/register"
          className="px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-gray-50"
        >
          {t('nav.register')}
        </Link>
      </div>
    </div>
  );
};

export default HomePage;