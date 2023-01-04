import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '../src/i18n/en';

export const resources = { en };
 
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({ debug: true, fallbackLng: 'en', resources });

export default i18n;
