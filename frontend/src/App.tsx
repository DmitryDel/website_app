import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from "./components/pages/HomePage.tsx";
import MainLayout from './components/layout/MainLayout';
import RegisterPage from "./components/pages/RegisterPage.tsx";
import LoginPage from "./components/pages/LoginPage.tsx";
import LibraryPage from "./components/pages/LibraryPage.tsx";
import FlashcardEditorPage from "./components/pages/FlashcardEditorPage.tsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* Главная страница */}
        <Route
          path="/"
          element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          }
        />

        {/* Страница регистрации */}
        <Route
          path="/register"
          element={
            <MainLayout>
              <RegisterPage />
            </MainLayout>
          }
        />

        {/* Страница входа */}
        <Route
          path="/login"
          element={
            <MainLayout>
              <LoginPage />
            </MainLayout>
          }
        />

        {/* Роут для библиотеки */}
        <Route
          path="/library"
          element={
            <MainLayout>
              <LibraryPage />
            </MainLayout>
          }
        />

        <Route
          path="/set/:setId/edit" // <-- Динамический маршрут
          element={
            <MainLayout>
              <FlashcardEditorPage />
            </MainLayout>
          }
        />

        {/* Здесь в будущем будут другие роуты */}
      </Routes>
    </Router>
  );
}

export default App;