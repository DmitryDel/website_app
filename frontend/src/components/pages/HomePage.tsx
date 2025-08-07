import { useAuthStore } from '../../store/useAuthStore';
import HomePageGuest from './HomePageGuest';
import HomePageUser from './HomePageUser';
import { FaSpinner } from 'react-icons/fa';

const HomePage = () => {
  // Вместо того чтобы выбирать объект, выбираем каждое значение отдельно.
  // Это предотвращает создание нового объекта при каждом рендере и разрывает бесконечный цикл.
  const token = useAuthStore((state) => state.token);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  // Пока хранилище не загрузило данные из localStorage, показываем спиннер.
  if (!isHydrated) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-indigo-600" />
      </div>
    );
  }

  // Вычисляем статус аутентификации по наличию токена
  const isAuthenticated = !!token;

  // В зависимости от статуса, показываем одну из двух версий страницы
  return isAuthenticated ? <HomePageUser /> : <HomePageGuest />;
};

export default HomePage;