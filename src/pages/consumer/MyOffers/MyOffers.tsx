// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes, useMatch, useNavigate } from 'react-router-dom';
import { AppPageHeader } from '@components/AppPageHeader';
import { Button } from '@components/Button';
import { EmptyList } from '@components/EmptyList';
import { ApproveContract, ModalApproveToken, tokenApprovalModalText } from '@components/ModalApproveToken';
import { TabButtons } from '@components/TabButton';
import TransactionModal from '@components/TransactionModal';
import { WalletRoute } from '@components/WalletRoute';
import { useSQToken, useWeb3 } from '@containers';
import { Spinner, Typography } from '@subql/components';
import {
  renderAsync,
  useGetOfferCountQuery,
  useGetOwnExpiredOffersLazyQuery,
  useGetOwnFinishedOffersLazyQuery,
  useGetOwnOpenOffersLazyQuery,
} from '@subql/react-hooks';
import { ROUTES, URLS } from '@utils';
import { EVENT_TYPE, EventBus } from '@utils/eventBus';
import dayjs from 'dayjs';
import i18next from 'i18next';

import { CreateOffer } from './CreateOffer';
import styles from './MyOffers.module.css';
import { OfferTable } from './OfferTable';

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

export const CheckOfferAllowance: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { offerAllowance } = useSQToken();
  const requiresTokenApproval = offerAllowance.result.data?.isZero();
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

export const OfferHeader: React.FC = () => {
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
  queryFn:
    | typeof useGetOwnOpenOffersLazyQuery
    | typeof useGetOwnFinishedOffersLazyQuery
    | typeof useGetOwnExpiredOffersLazyQuery;
  totalCount: number;
  description?: string;
  queryParams?: { expiredDate?: Date };
}

const MyOffer: React.FC<MyOfferProps> = ({ queryFn, totalCount, description, queryParams }) => {
  const { account } = useWeb3();

  const navigate = useNavigate();

  React.useEffect(() => {
    if (totalCount <= 0) {
      navigate(CONSUMER_OFFERS_NAV);
    }
  }, [navigate, totalCount]);

  return (
    <div className={styles.content}>
      <OfferHeader />
      <div className="contentContainer">
        <OfferTable
          queryFn={queryFn}
          queryParams={{ consumer: account || '', expireDate: queryParams?.expiredDate }}
          description={description}
        />
      </div>
    </div>
  );
};

const NoOffers: React.FC = () => {
  const { t } = useTranslation();
  return (
    <EmptyList
      title={t('myOffers.noOffersTitle')}
      description={[t('myOffers.noOffersDesc_1'), t('myOffers.noOffersDesc_2')]}
      infoI18nKey={'myOffers.noOffersInfoLink'}
      infoLinkDesc={t('myOffers.noOffersInfoLink')}
      infoLink={URLS.PLANS_OFFERS}
    >
      <CheckOfferAllowance />
    </EmptyList>
  );
};

export const MyOffers: React.FC = () => {
  const { t } = useTranslation();
  const { account } = useWeb3();
  const { offerAllowance } = useSQToken();
  const match = useMatch(`${CONSUMER_OFFERS_NAV}/${CREATE_OFFER}`);
  const requiresTokenApproval = offerAllowance.result.data?.isZero();
  const offers = useGetOfferCountQuery({
    variables: { consumer: account ?? '' },
    fetchPolicy: 'network-only',
  });

  const title = match?.pathname ? t('myOffers.createOffer') : t('myOffers.title');

  React.useEffect(() => {
    const refresh = () => {
      offers.refetch();
    };
    EventBus.on(EVENT_TYPE.CREATED_CONSUMER_OFFER, refresh);

    return () => {
      EventBus.off(EVENT_TYPE.CREATED_CONSUMER_OFFER, refresh);
    };
  }, []);

  return (
    <div>
      <AppPageHeader title={title} />
      {renderAsync(offers, {
        loading: () => <Spinner />,
        error: (e) => <Typography>{`Failed to load offers: ${e}`}</Typography>,
        data: (offers) => {
          const { totalCount } = offers.offers || { totalCount: 0 };
          return (
            <>
              <WalletRoute
                componentMode
                element={
                  <Routes>
                    <Route
                      path={OPEN_OFFERS}
                      element={
                        <MyOffer key="openOffers" queryFn={useGetOwnOpenOffersLazyQuery} totalCount={totalCount} />
                      }
                    />
                    <Route
                      path={CLOSE_OFFERS}
                      element={
                        <MyOffer
                          key="closedOffers"
                          queryFn={useGetOwnFinishedOffersLazyQuery}
                          description={t('myOffers.closedDescription')}
                          totalCount={totalCount}
                          queryParams={{
                            expiredDate: dayjs('1970-1-2').toDate(),
                          }}
                        />
                      }
                    />
                    <Route
                      path={EXPIRED_OFFERS}
                      element={
                        <MyOffer
                          key="expiredOffers"
                          queryFn={useGetOwnExpiredOffersLazyQuery}
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
                  </Routes>
                }
              ></WalletRoute>
            </>
          );
        },
      })}
    </div>
  );
};
