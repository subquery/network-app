// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Redirect, Route, Switch, useHistory } from 'react-router-dom';
import {
  AppPageHeader,
  ApproveContract,
  ModalApproveToken,
  TabButtons,
  tokenApprovalModalText,
} from '../../../components';
import { useTranslation } from 'react-i18next';
import styles from './MyOffers.module.css';
import i18next from 'i18next';
import { CreateOffer } from './CreateOffer';
import { Button } from '../../../components/Button';
import { useOwnExpiredOffers, useOwnFinishedOffers, useOwnOpenOffers, useSQToken, useWeb3 } from '../../../containers';
import { OfferTable } from './OfferTable';
import TransactionModal from '../../../components/TransactionModal';

const OFFERS_ROUTE = '/plans/my-offers';
export const OPEN_OFFERS = `${OFFERS_ROUTE}/open`;
export const CLOSE_OFFERS = `${OFFERS_ROUTE}/close`;
export const EXPIRED_OFFERS = `${OFFERS_ROUTE}/expired`;
export const CREATE_OFFER = `${OFFERS_ROUTE}/create`;

const buttonLinks = [
  { label: i18next.t('myOffers.open'), link: OPEN_OFFERS, tooltip: i18next.t('myOffers.openTooltip') },
  { label: i18next.t('myOffers.closed'), link: CLOSE_OFFERS, tooltip: i18next.t('myOffers.closedTooltip') },
  { label: i18next.t('myOffers.expired'), link: EXPIRED_OFFERS, tooltip: i18next.t('myOffers.expiredTooltip') },
];

// TODO: For user experiences, maybe can consider have warning notification
export const TokenAllowanceProtect: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { offerAllowance } = useSQToken();
  const requiresTokenApproval = offerAllowance.data?.isZero();

  if (requiresTokenApproval) {
    return <Redirect to={OPEN_OFFERS} />;
  } else {
    return children;
  }
};

export const CheckOfferAllowance: React.VFC = () => {
  const { t } = useTranslation();
  const history = useHistory();
  const { offerAllowance } = useSQToken();
  const requiresTokenApproval = offerAllowance.data?.isZero();

  if (requiresTokenApproval) {
    return (
      <TransactionModal
        actions={[{ label: t('myOffers.createOffer'), key: 'createOffer' }]}
        text={tokenApprovalModalText}
        renderContent={() => {
          return (
            <ModalApproveToken
              contract={ApproveContract.PurchaseOfferMarket}
              onSubmit={() => offerAllowance.refetch()}
              onSuccess={() => history.push(CREATE_OFFER)}
            />
          );
        }}
      />
    );
  } else {
    return <Button onClick={() => history.push(CREATE_OFFER)}>{t('myOffers.createOffer')}</Button>;
  }
};

export const OfferHeader: React.VFC = () => {
  const { t } = useTranslation();

  return (
    <>
      <AppPageHeader title={t('myOffers.title')} />

      <div className={styles.tabs}>
        <TabButtons tabs={buttonLinks} whiteTab />
        <div className={styles.create}>
          <CheckOfferAllowance />
        </div>
      </div>
    </>
  );
};

export const MyOffers: React.VFC = () => {
  const { account } = useWeb3();
  const MyOffers = ({ queryFn }: { queryFn: typeof useOwnOpenOffers }) => {
    return (
      <div className="contentContainer">
        <OfferTable queryFn={queryFn} queryParams={{ consumer: account || '' }} />
      </div>
    );
  };

  return (
    <Switch>
      <Route
        exact
        path={OPEN_OFFERS}
        component={() => (
          <>
            <OfferHeader />
            <MyOffers queryFn={useOwnOpenOffers} />
          </>
        )}
      />
      <Route
        exact
        path={CLOSE_OFFERS}
        component={() => (
          <>
            <OfferHeader />
            <MyOffers queryFn={useOwnFinishedOffers} />
          </>
        )}
      />
      <Route
        exact
        path={EXPIRED_OFFERS}
        component={() => (
          <>
            <OfferHeader />
            <MyOffers queryFn={useOwnExpiredOffers} />
          </>
        )}
      />
      <Route
        exact
        path={CREATE_OFFER}
        component={() => (
          <TokenAllowanceProtect>
            <CreateOffer />
          </TokenAllowanceProtect>
        )}
      />
      <Redirect from={OFFERS_ROUTE} to={OPEN_OFFERS} />
    </Switch>
  );
};
