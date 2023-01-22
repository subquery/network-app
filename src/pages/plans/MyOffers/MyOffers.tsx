// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Navigate, Route, Routes, useMatch, useNavigate } from 'react-router-dom';
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

export const OPEN_OFFERS = `open`;
export const CLOSE_OFFERS = `close`;
export const EXPIRED_OFFERS = `expired`;
export const CREATE_OFFER = `create`;

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
    return <Route element={<Navigate replace to={OPEN_OFFERS} />} />;
  } else {
    return children;
  }
};

export const CheckOfferAllowance: React.VFC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
              onSuccess={() => navigate(CREATE_OFFER)}
            />
          );
        }}
      />
    );
  } else {
    return <Button onClick={() => navigate(CREATE_OFFER)}>{t('myOffers.createOffer')}</Button>;
  }
};

export const OfferHeader: React.VFC<{ title: string }> = ({ title }) => {
  return (
    <>
      <AppPageHeader title={title} />
      <div className={styles.tabs}>
        <TabButtons tabs={buttonLinks} whiteTab />
        <div className={styles.create}>
          <CheckOfferAllowance />
        </div>
      </div>
    </>
  );
};

interface MyOfferProps {
  queryFn: typeof useOwnOpenOffers | typeof useOwnFinishedOffers | typeof useOwnExpiredOffers;
  description?: string;
}

const MyOffer: React.FC<MyOfferProps> = ({ queryFn, description }) => {
  const { account } = useWeb3();
  return (
    <>
      <div className="contentContainer">
        <OfferTable queryFn={queryFn} queryParams={{ consumer: account || '' }} description={description} />
      </div>
    </>
  );
};

export const MyOffers: React.VFC = () => {
  const { t } = useTranslation();
  const match = useMatch('/plans/my-offers/create');

  return (
    <>
      {match?.pathname ? (
        <AppPageHeader title={t('myOffers.createOffer')} />
      ) : (
        <OfferHeader title={t('myOffers.title')} />
      )}
      <Routes>
        <Route path={OPEN_OFFERS} element={<MyOffer queryFn={useOwnOpenOffers} />} />
        <Route
          path={CLOSE_OFFERS}
          element={<MyOffer queryFn={useOwnFinishedOffers} description={t('myOffers.closedDescription')} />}
        />
        <Route
          path={EXPIRED_OFFERS}
          element={<MyOffer queryFn={useOwnExpiredOffers} description={t('myOffers.expiredDescription')} />}
        />
        <Route
          path={CREATE_OFFER}
          element={
            <TokenAllowanceProtect>
              <CreateOffer />
            </TokenAllowanceProtect>
          }
        />
        <Route path={'/'} element={<Navigate replace to={OPEN_OFFERS} />} />
      </Routes>
    </>
  );
};
