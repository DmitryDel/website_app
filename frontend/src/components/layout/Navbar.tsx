import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/useAuthStore'; // <-- Импортируем хранилище
import { FaTelegramPlane, FaBars, FaTimes, FaFire } from 'react-icons/fa';
import { GB, RU } from 'country-flag-icons/react/3x2'
import {NavLink, useNavigate} from "react-router-dom"; // заменил импорт библиотеки

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Correctly subscribe to individual state properties to prevent re-render loops
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  // Derive the authentication status from the presence of the token
  const isAuthenticated = !!token;
  const currentLanguage = i18n.language;

  const changeLanguage = () => {
    const newLang = currentLanguage === 'en' ? 'ru' : 'en';
    i18n.changeLanguage(newLang);
  };

  // Handler for logging out and redirecting the user
  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  // Helper for NavLink active styling
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    isActive ? "text-indigo-600 font-bold" : "text-gray-600 hover:text-indigo-600 font-medium";

  const getMobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded-md font-medium ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'}`;

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="text-2xl font-bold text-indigo-600 flex-shrink-0">
            FlashcardsApp
          </NavLink>

          {/* Desktop: Center Links */}
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              <>
                <NavLink to="/library" className={getNavLinkClass}>Flashcards Library</NavLink>
                <NavLink to="/practice" className={getNavLinkClass}>Flashcards Practice</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/why-it-works" className={getNavLinkClass}>{t('nav.whyItWorks')}</NavLink>
                <NavLink to="/study-smarter" className={getNavLinkClass}>{t('nav.studySmarter')}</NavLink>
              </>
            )}
          </div>

          {/* Right-side controls */}
          <div className="flex items-center space-x-2">
            <div className="hidden md:flex items-center space-x-4 text-gray-600">
              <FaTelegramPlane className="w-5 h-5" />
              <span>support@flashcards.app</span>
            </div>

            <button onClick={changeLanguage} className="p-2 rounded-full hover:bg-gray-100">
              {currentLanguage === 'en' ? <GB className="w-6 h-6 rounded-full" /> : <RU className="w-6 h-6 rounded-full" />}
            </button>

            {/* Desktop: Auth controls */}
            <div className="hidden md:flex items-center space-x-2">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-indigo-600">Log Out</button>
                  <div className="w-10 h-10 bg-indigo-200 rounded-full flex items-center justify-center font-bold text-indigo-700 cursor-pointer">D</div>
                </div>
              ) : (
                <>
                  <NavLink to="/login" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">{t('nav.login')}</NavLink>
                  <NavLink to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700">{t('nav.register')}</NavLink>
                </>
              )}
            </div>

            {/* Mobile: Hamburger Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-gray-600 hover:text-indigo-600">
                {isMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {isAuthenticated ? (
              <>
                 <NavLink to="/library" className={getMobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Flashcards Library</NavLink>
                 <NavLink to="/practice" className={getMobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Flashcards Practice</NavLink>
                 <div className="border-t border-gray-200 my-2"></div>
                 <button onClick={handleLogout} className="block w-full text-left text-red-600 hover:bg-gray-100 px-3 py-2 rounded-md font-medium">Log Out</button>
              </>
            ) : (
              <>
                <NavLink to="/why-it-works" className={getMobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>{t('nav.whyItWorks')}</NavLink>
                <NavLink to="/study-smarter" className={getMobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>{t('nav.studySmarter')}</NavLink>
                <div className="border-t border-gray-200 my-2"></div>
                <NavLink to="/login" className={getMobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>{t('nav.login')}</NavLink>
                <NavLink to="/register" className="block w-full text-left bg-indigo-600 text-white px-3 py-2 rounded-md font-medium hover:bg-indigo-700" onClick={() => setIsMenuOpen(false)}>{t('nav.register')}</NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;