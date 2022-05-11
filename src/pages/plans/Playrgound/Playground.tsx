// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useServiceAgreements, useWeb3 } from '../../../containers';

export const Playground: React.VFC = () => {
  const { t } = useTranslation();
  const { account } = useWeb3();

  return (
    <div>
      <div>Playground</div>
    </div>
  );
};
