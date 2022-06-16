// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import assert from 'assert';
import { Button } from 'antd';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@subql/react-ui';
import { useContracts } from '../../../containers';
import TransactionModal from '../../../components/TransactionModal';
import { getCapitalizedStr } from '../../../utils';
import styles from './MyOffers.module.css';

type Props = {
  offerId: string;
};

// TODO: SUMMARY LIST
export const CancelOffer: React.FC<Props> = ({ offerId }) => {
  const { t } = useTranslation();
  const pendingContracts = useContracts();

  const text = {
    title: t('myOffers.cancel.title'),
    steps: [t('general.confirm'), t('general.confirmOnMetamask')],
    description: t('myOffers.cancel.description'),
    inputTitle: '',
    submitText: t('general.confirmCancellation'),
    failureText: t('myOffers.cancel.failureText'),
  };

  const handleClick = async () => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    return contracts.purchaseOfferMarket.cancelPurchaseOffer(offerId);
  };

  return (
    <TransactionModal
      variant="errTextBtn"
      text={text}
      actions={[{ label: getCapitalizedStr(t('general.cancel')), key: 'cancel' }]}
      onClick={handleClick}
      renderContent={(onSubmit, _, isLoading, error) => {
        return (
          <>
            <Typography className={'errorText'}>{error}</Typography>
            <div className={styles.btnContainer}>
              <Button onClick={onSubmit} htmlType="submit" shape="round" size="large" danger loading={isLoading}>
                {text.submitText}
              </Button>
            </div>
          </>
        );
      }}
    />
  );
};
