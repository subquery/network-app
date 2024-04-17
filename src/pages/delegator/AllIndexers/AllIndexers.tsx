// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyList } from '@components';
import RpcError from '@components/RpcError';
import { useEra } from '@hooks';
import { Spinner, Typography } from '@subql/components';
import { useGetAllIndexerByAprQuery } from '@subql/react-hooks';

import { isRPCError, mapAsync, mergeAsync, notEmpty, renderAsync } from '../../../utils';
import { IndexerList } from './IndexerList/IndexerList';

export const AllIndexers: React.FC = () => {
  const indexers = useGetAllIndexerByAprQuery();
  const { currentEra } = useEra();
  const { t } = useTranslation();

  return (
    <div>
      {renderAsync(
        mapAsync(
          ([data, curEra]) => ({
            data: data?.indexerAPRSummaries?.nodes.filter(notEmpty),
            totalCount: data?.indexerAPRSummaries?.totalCount,
            era: curEra?.index,
          }),
          mergeAsync(indexers, currentEra),
        ),
        {
          loading: () => <Spinner />,
          error: (error) => {
            if (isRPCError(error)) {
              return <RpcError></RpcError>;
            }

            return <Typography>{`Error: Failed to get Indexers: ${error.message}`}</Typography>;
          },
          data: (data) => {
            if (!data || data?.totalCount === 0) {
              <EmptyList title={t('allIndexers.nonData')} description={t('allIndexers.desc')}></EmptyList>;
            }

            return <IndexerList key="allInexer" totalCount={data.totalCount} era={data.era} />;
          },
        },
      )}
    </div>
  );
};

export default AllIndexers;
