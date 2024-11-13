// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { AppPageHeader } from '@components/AppPageHeader';
import { TOP_100_INDEXERS } from '@containers';
import { useGetTopIndexersQuery } from '@subql/react-hooks';
import { Typography } from 'antd';

import Spinner from '../../../components/Spinner/Spinner';
import { renderAsync } from '../../../utils';
import { TopIndexerList } from './TopIndexersList';

export const TopIndexers: React.FC = () => {
  const { t } = useTranslation();
  const topIndexers = useGetTopIndexersQuery({
    context: { clientName: TOP_100_INDEXERS },
  });

  return (
    <div>
      <AppPageHeader title={'All Node Operators'} desc={'View All Node Operators in the SubQuery Network'} />
      {renderAsync(topIndexers, {
        loading: () => <Spinner></Spinner>,
        error: (error) => (
          <>
            <Typography.Text type="danger">Error: </Typography.Text>{' '}
            <Typography.Text type="secondary">{`Failed to get top Indexers: ${error.message}`}</Typography.Text>
          </>
        ),
        data: (data) => {
          const topIndexers = data?.indexerPrograms;

          if (!topIndexers) {
            return <Typography>{t('topIndexers.nonData')}</Typography>;
          }
          return <TopIndexerList indexers={topIndexers} />;
        },
      })}
    </div>
  );
};

export default TopIndexers;
