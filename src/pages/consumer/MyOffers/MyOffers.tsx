// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Navigate, Route, Routes, useMatch, useNavigate } from 'react-router-dom';
import {
  AppPageHeader,
  ApproveContract,
  ModalApproveToken,
  Spinner,
  TabButtons,
  tokenApprovalModalText,
} from '../../../components';
import { Trans, useTranslation } from 'react-i18next';
import styles from './MyOffers.module.css';
import i18next from 'i18next';
import { CreateOffer } from './CreateOffer';
import { Button } from '../../../components/Button';
import {
  useOwnExpiredOffers,
  useOwnFinishedOffers,
  useOwnOfferCount,
  useOwnOpenOffers,
  useSQToken,
  useWeb3,
} from '../../../containers';
import { OfferTable } from './OfferTable';
import TransactionModal from '../../../components/TransactionModal';
import { renderAsync } from '@subql/react-hooks';
import { Typography } from '@subql/react-ui';

export const OPEN_OFFERS = `open`;
export const CLOSE_OFFERS = `close`;
export const EXPIRED_OFFERS = `expired`;
export const CREATE_OFFER = `create`;

const buttonLinks = [
  { label: i18next.t('myOffers.open'), link: '/consumer/my-offers/open', tooltip: i18next.t('myOffers.openTooltip') },
  {
    label: i18next.t('myOffers.closed'),
    link: '/consumer/my-offers/close',
    tooltip: i18next.t('myOffers.closedTooltip'),
  },
  {
    label: i18next.t('myOffers.expired'),
    link: '/consumer/my-offers/expired',
    tooltip: i18next.t('myOffers.expiredTooltip'),
  },
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
              onSuccess={() => navigate('/consumer/my-offers/create')}
            />
          );
        }}
      />
    );
  } else {
    return <Button onClick={() => navigate('/consumer/my-offers/create')}>{t('myOffers.createOffer')}</Button>;
  }
};

export const OfferHeader: React.VFC = () => {
  return (
    <>
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
      <OfferHeader />
      <div className="contentContainer">
        <OfferTable queryFn={queryFn} queryParams={{ consumer: account || '' }} description={description} />
      </div>
    </>
  );
};

const NoOffers: React.VFC = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.noOffersContainer}>
      <Typography variant="h5">{t('myOffers.noOffersTitle')}</Typography>
      <Typography className={styles.description}>{t('myOffers.noOffersDescription')}</Typography>
      <Typography className={styles.infoLink}>
        <Trans i18nKey={'myOffers.noOffersInfoLink'}>
          {t('myOffers.noOffersInfoLink')}
          <a href="/">here</a>
        </Trans>
      </Typography>
      <div className={styles.noOffersButton}>
        <CheckOfferAllowance />
      </div>
    </div>
  );
};

export const MyOffers: React.VFC = () => {
  const { t } = useTranslation();
  const { account } = useWeb3();
  const navigate = useNavigate();
  const match = useMatch('/consumer/my-offers/create');
  const count = useOwnOfferCount({ consumer: account ?? '' });

  React.useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => {
        window.location.reload();
        navigate('/consumer/my-offers');
      });
    }
  });

  return renderAsync(count, {
    loading: () => <Spinner />,
    error: (e) => <Typography>{`Failed to load offers: ${e}`}</Typography>,
    data: (count) => {
      const title = match?.pathname ? t('myOffers.createOffer') : t('myOffers.title');
      const { totalCount } = count.offers || {};
      return (
        <>
          <AppPageHeader title={title} />
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
            <Route path={'/'} element={totalCount === 0 ? <NoOffers /> : <Navigate replace to={OPEN_OFFERS} />} />
          </Routes>
        </>
      );
    },
  });
};
