import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    // Этот div растягивается на весь экран по высоте и является flex-колонкой
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Основной контент теперь тоже flex-контейнер.
        'flex-grow' заставляет его занять всё доступное пространство между шапкой и подвалом.
        'flex' и 'items-center' центрируют дочерний элемент по вертикали и горизонтали.
      */}
      <main className="flex-grow flex items-center justify-center">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;