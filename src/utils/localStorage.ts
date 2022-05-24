// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import CryptoJS from 'crypto-js';

export const encrypt = (value: string | null, key = 'subquery testnet'): string =>
  value ? CryptoJS.DES.encrypt(value, key).toString() : '';
export const decrypt = (value: string | null, key = 'subquery testnet'): string =>
  value ? CryptoJS.DES.decrypt(value, key).toString(CryptoJS.enc.Utf8) : '';

export const setStorage = (key: string, value: string): void => {
  localStorage.setItem(key, value);
};

export const getStorage = (key: string): string | null => {
  return localStorage.getItem(key);
};

export const removeStorage = (key: string): void => {
  return localStorage.removeItem(key);
};

export const setEncryptStorage = (key: string, value: string): void => {
  const encryptValue = encrypt(value);
  localStorage.setItem(key, encryptValue);
};

export const getEncryptStorage = (key: string): string => {
  return decrypt(localStorage.getItem(key));
};
