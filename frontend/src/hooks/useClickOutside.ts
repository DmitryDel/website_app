import { useEffect, type RefObject } from 'react';

type Event = MouseEvent | TouchEvent;

export const useClickOutside = <T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: Event) => void
) => {
  useEffect(() => {
    const listener = (event: Event) => {
      const el = ref.current;
      // Ничего не делаем, если клик был внутри элемента или на самом элементе
      if (!el || el.contains((event?.target as Node) || null)) {
        return;
      }
      handler(event); // Вызываем наш обработчик (например, закрытие меню)
    };

    // Добавляем слушатели событий
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    // Убираем слушатели при размонтировании компонента, чтобы избежать утечек памяти
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]); // Пересоздаем эффект, только если ref или handler изменились
};