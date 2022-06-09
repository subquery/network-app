// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { CreateOfferContext } from '../CreateOffer';
import styles from './CustomOffer.module.css';

export const CustomOffer: React.VFC = () => {
  const { t } = useTranslation();
  const createOfferContext = React.useContext(CreateOfferContext);

  return (
    <div>
      <div>CurStep: {createOfferContext?.curStep}</div> CustomOffer
    </div>
  );
};
