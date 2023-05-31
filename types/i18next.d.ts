// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import 'i18next';
import { TranslationKeys, GetDictValue } from '@i18n';

// reference: https://www.i18next.com/overview/typescript#argument-of-type-defaulttfuncreturn-is-not-assignable-to-parameter-of-type-xyz
declare module 'i18next' {
  interface CustomTypeOptions {
    returnNull: false;
  }

  interface TFunction {
    <T extends TranslationKeys>(key: T, options?: TOptions): GetDictValue<T>;
  }
}
