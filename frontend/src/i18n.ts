import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ru from './locales/ru.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
    },
    lng: 'en', // язык по умолчанию
    fallbackLng: 'en', // язык, который будет использоваться, если перевод отсутствует
    interpolation: {
      escapeValue: false, // не экранировать значения, React уже это делает
    },
  });

export default i18n;