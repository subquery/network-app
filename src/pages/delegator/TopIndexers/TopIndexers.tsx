// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from 'antd';

import { GetTopIndexers_indexerPrograms as TopIndexersPrograms } from '../../../__generated__/excellentIndexers/GetTopIndexers';
import { useTopIndexers } from '../../../containers/QueryTop100Indexers';
import { getUseQueryFetchMore, renderAsync } from '../../../utils';
import { TopIndexerList } from './TopIndexersList';

export const TopIndexers: React.FC = () => {
  const { t } = useTranslation();
  const topIndexers = useTopIndexers();

  // TODO: add pagination
  const fetchMore = (offset: number) => {
    getUseQueryFetchMore(topIndexers, { offset });
  };

  return (
    <div>
      {renderAsync(topIndexers, {
        error: (error) => (
          <>
            <Typography.Text type="danger">Error: </Typography.Text>{' '}
            <Typography.Text type="secondary">{`Failed to get top Indexers: ${error.message}`}</Typography.Text>
          </>
        ),
        data: (data) => {
          const topIndexers = data?.indexerPrograms as TopIndexersPrograms[];

          if (!topIndexers) {
            return <Typography>{t('topIndexers.nonData')}</Typography>;
          }
          return <TopIndexerList indexers={topIndexers} />;
        },
      })}
    </div>
  );
};
