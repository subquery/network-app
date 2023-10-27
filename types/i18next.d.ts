// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { GetDictValue, TranslationKeys } from '@i18n';

import 'i18next';

// reference: https://www.i18next.com/overview/typescript#argument-of-type-defaulttfuncreturn-is-not-assignable-to-parameter-of-type-xyz
declare module 'i18next' {
  interface CustomTypeOptions {
    returnNull: false;
    // WARNING
    // i18next can config this for tips, but it has bug now.
    // https://github.com/i18next/i18next/issues/1956   Don't close for now.
    // And the declare in typescript is a deep merge. https://www.typescriptlang.org/docs/handbook/declaration-merging.html
    // So the TFunction we override will be merge with the default definition.
    // The default is `string`, so add a wrong type definition to override the `string`.
    // TODO: If the above issue solved will use this instead of override.
    resources: { 'z-dont-use-it': '' };
  }

  interface TFunction {
    <T extends TranslationKeys>(key: T, options?: TOptions): GetDictValue<T>;
  }
}
