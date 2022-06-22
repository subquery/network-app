// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import assert from 'assert';
import { Button } from 'antd';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@subql/react-ui';
import { useContracts } from '../../../containers';
import TransactionModal from '../../../components/TransactionModal';
import { convertStringToNumber, formatEther, getCapitalizedStr } from '../../../utils';
import styles from './MyOffers.module.css';
import { useLocation } from 'react-router';
import { EXPIRED_OFFERS, OPEN_OFFERS } from './MyOffers';
import { useNetworkClient } from '../../../hooks';
import { SummaryList } from '../../../components';

type Props = {
  offerId: string;
};

// TODO: SUMMARY LIST
export const CancelOffer: React.FC<Props> = ({ offerId }) => {
  const [cancelPenalty, setCancelPenalty] = React.useState<string>();
  // const [unSpent, setUnSpent] = React.useState();
  // const [receive, setReceive] = React.useState();
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const pendingContracts = useContracts();
  const networkClient = useNetworkClient();

  React.useEffect(() => {
    async function getCancelPenalty() {
      const client = await networkClient;
      if (client && pathname === OPEN_OFFERS) {
        const offer = convertStringToNumber(offerId);
        const cancelPenalty = await client.cancelOfferPenaltyFee(offer);
        setCancelPenalty(formatEther(cancelPenalty));

        // const unSpent = await client.cancelOfferUnspentBalance(offer);
        // setUnSpent(formatEther(unSpent))
      }
    }
    getCancelPenalty();
  }, [networkClient, offerId, pathname]);

  const cancelOfferSummary = [
    {
      label: t('myOffers.cancel.cancelFee'),
      value: `${cancelPenalty} SQT`,
    },
  ];

  const CancelOfferSummary = () => (
    <div className={styles.cancelOfferSummary}>
      <SummaryList list={cancelOfferSummary} />
    </div>
  );

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
            {pathname === OPEN_OFFERS && <CancelOfferSummary />}
            <Typography className={'errorText'}>{error}</Typography>
            <div className={styles.btnContainer}>
              <Button
                onClick={onSubmit}
                htmlType="submit"
                shape="round"
                size="large"
                danger={!isExpiredPath}
                type={'primary'}
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
