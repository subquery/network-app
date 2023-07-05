// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { initReactI18next } from 'react-i18next';
import i18n, { t } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './en';

export const resources = { en } as const;

i18n.use(LanguageDetector).use(initReactI18next).init({
  debug: true,
  fallbackLng: 'en',
  resources,
  defaultNS: 'translation',
  returnNull: false,
});

type Combine<T extends string | number | symbol, P extends string> = T extends string | number
  ? P extends ''
    ? T
    : `${P}.${T}`
  : never;

type ObjectKeyPaths<T extends object, P extends string = '', K extends keyof T = keyof T> = K extends string | number
  ? // just check T[K] is a Object type { xxx: 'yyy' }
    T[K] extends object
    ? ObjectKeyPaths<T[K], Combine<K, P>>
    : Combine<K, P>
  : never;

// GetDictValue copy from https://stackoverflow.com/questions/58277973/how-to-type-check-i18n-dictionaries-with-typescript
export type GetDictValue<
  T extends string,
  O = (typeof resources)['en']['translation'],
> = T extends `${infer A}.${infer B}`
  ? A extends keyof O
    ? GetDictValue<B, O[A]>
    : never
  : T extends keyof O
  ? O[T]
  : never;

export type TranslationKeys = ObjectKeyPaths<(typeof resources)['en']['translation']>;

export default i18n;

console.warn(t('account.linkText.delegating'));
