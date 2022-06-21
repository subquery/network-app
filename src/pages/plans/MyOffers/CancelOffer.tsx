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
import { useLocation } from 'react-router';
import { EXPIRED_OFFERS } from './MyOffers';

type Props = {
  offerId: string;
};

// TODO: SUMMARY LIST
export const CancelOffer: React.FC<Props> = ({ offerId }) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const pendingContracts = useContracts();

  const canCelText = {
    title: t('myOffers.cancel.title'),
    steps: [t('general.confirm'), t('general.confirmOnMetamask')],
    description: t('myOffers.cancel.description'),
    submitText: t('general.confirmCancellation'),
    failureText: t('myOffers.cancel.failureText'),
  };

  const withdrawText = {
    title: t('myOffers.withdraw.modalTitle'),
    steps: [t('general.confirm'), t('general.confirmOnMetamask')],
    description: t('myOffers.withdraw.description'),
    submitText: t('general.confirm'),
    failureText: t('myOffers.withdraw.failureText'),
  };

  const isExpiredPath = pathname === EXPIRED_OFFERS;
  const buttonVariant = isExpiredPath ? 'textBtn' : 'errTextBtn';
  const text = isExpiredPath ? withdrawText : canCelText;
  const actionBtnLabel = isExpiredPath ? t('myOffers.withdraw.title') : t('general.cancel');

  const handleClick = async () => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    return contracts.purchaseOfferMarket.cancelPurchaseOffer(offerId);
  };

  return (
    <TransactionModal
      variant={buttonVariant}
      text={text}
      actions={[{ label: getCapitalizedStr(actionBtnLabel), key: 'cancel' }]}
      onClick={handleClick}
      renderContent={(onSubmit, _, isLoading, error) => {
        return (
          <>
            <Typography className={'errorText'}>{error}</Typography>
            <div className={styles.btnContainer}>
              <Button
                onClick={onSubmit}
                htmlType="submit"
                shape="round"
                size="large"
                danger={!isExpiredPath}
                type={isExpiredPath ? 'primary' : 'default'}
                loading={isLoading}
              >
                {text.submitText}
              </Button>
            </div>
          </>
        );
      }}
    />
  );
};
