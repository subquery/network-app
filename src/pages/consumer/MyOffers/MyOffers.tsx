// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Navigate, Outlet, Route, Routes, useMatch, useNavigate } from 'react-router-dom';
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
import { useSQToken, useWeb3 } from '../../../containers';
import { OfferTable } from './OfferTable';
import TransactionModal from '../../../components/TransactionModal';
import {
  renderAsync,
  useGetOfferCountQuery,
  useGetOwnExpiredOffersQuery,
  useGetOwnFinishedOffersQuery,
  useGetOwnOpenOffersQuery,
} from '@subql/react-hooks';
import { Typography } from '@subql/react-ui';
import { ROUTES } from '../../../utils';

const { CONSUMER_OFFERS_NAV, CREATE_OFFER, OPEN_OFFERS, CLOSE_OFFERS, EXPIRED_OFFERS } = ROUTES;

const buttonLinks = [
  {
    label: i18next.t('myOffers.open'),
    link: `${CONSUMER_OFFERS_NAV}/${OPEN_OFFERS}`,
    tooltip: i18next.t('myOffers.openTooltip'),
  },
  {
    label: i18next.t('myOffers.closed'),
    link: `${CONSUMER_OFFERS_NAV}/${CLOSE_OFFERS}`,
    tooltip: i18next.t('myOffers.closedTooltip'),
  },
  {
    label: i18next.t('myOffers.expired'),
    link: `${CONSUMER_OFFERS_NAV}/${EXPIRED_OFFERS}`,
    tooltip: i18next.t('myOffers.expiredTooltip'),
  },
];

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
              onSuccess={() => navigate(`${CONSUMER_OFFERS_NAV}/${CREATE_OFFER}`)}
            />
          );
        }}
      />
    );
  } else {
    return (
      <Button onClick={() => navigate(`${CONSUMER_OFFERS_NAV}/${CREATE_OFFER}`)}>{t('myOffers.createOffer')}</Button>
    );
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
  queryFn: typeof useGetOwnOpenOffersQuery | typeof useGetOwnFinishedOffersQuery | typeof useGetOwnExpiredOffersQuery;
  totalCount: number;
  description?: string;
}

const MyOffer: React.FC<MyOfferProps> = ({ queryFn, totalCount, description }) => {
  const { account } = useWeb3();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (totalCount <= 0) {
      navigate(CONSUMER_OFFERS_NAV);
    }
  }, [navigate, totalCount]);

  return (
    <>
      {totalCount <= 0 && <Navigate replace to={CONSUMER_OFFERS_NAV} />}
      {totalCount > 0 && (
        <>
          <OfferHeader />
          <div className="contentContainer">
            <OfferTable queryFn={queryFn} queryParams={{ consumer: account || '' }} description={description} />
          </div>
        </>
      )}
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

export const MyOffersContainer: React.VFC = () => {
  const match = useMatch(`${CONSUMER_OFFERS_NAV}/${CREATE_OFFER}`);
  const { t } = useTranslation();
  const title = match?.pathname ? t('myOffers.createOffer') : t('myOffers.title');
  return (
    <>
      <AppPageHeader title={title} />
      <Outlet />
    </>
  );
};

export const MyOffers: React.VFC = () => {
  const { t } = useTranslation();
  const { account } = useWeb3();
  const { offerAllowance } = useSQToken();
  const requiresTokenApproval = offerAllowance.data?.isZero();
  const offers = useGetOfferCountQuery({ variables: { consumer: account ?? '' } });

  React.useEffect(() => {
    offers.refetch();
  }, [offers, account]);

  return renderAsync(offers, {
    loading: () => <Spinner />,
    error: (e) => <Typography>{`Failed to load offers: ${e}`}</Typography>,
    data: (offers) => {
      const { totalCount } = offers.offers || { totalCount: 0 };
      return (
        <Routes>
          <Route path={'/'} element={<MyOffersContainer />}>
            <Route
              path={OPEN_OFFERS}
              element={<MyOffer queryFn={useGetOwnOpenOffersQuery} totalCount={totalCount} />}
            />
            <Route
              path={CLOSE_OFFERS}
              element={
                <MyOffer
                  queryFn={useGetOwnFinishedOffersQuery}
                  description={t('myOffers.closedDescription')}
                  totalCount={totalCount}
                />
              }
            />
            <Route
              path={EXPIRED_OFFERS}
              element={
                <MyOffer
                  queryFn={useGetOwnExpiredOffersQuery}
                  description={t('myOffers.expiredDescription')}
                  totalCount={totalCount}
                />
              }
            />
            <Route
              path={CREATE_OFFER}
              element={!requiresTokenApproval ? <CreateOffer /> : <Navigate replace to={CONSUMER_OFFERS_NAV} />}
            />
            <Route path={'/'} element={totalCount <= 0 ? <NoOffers /> : <Navigate to={OPEN_OFFERS} />} />
          </Route>
        </Routes>
      );
    },
  });
};
