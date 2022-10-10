// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useTopIndexers } from '../../../../containers/QueryTop100Indexers';
import { getUseQueryFetchMore, renderAsync } from '../../../../utils';
import { Typography } from 'antd';
import { TopIndexerList } from './TopIndexersList';
import { GetTopIndexers_indexerPrograms } from '../../../../__generated__/excellentIndexers/GetTopIndexers';

export const TopIndexers: React.VFC = () => {
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
          <Typography.Text type="danger">{`Error: Failed to get top Indexers: ${error.message}`}</Typography.Text>
        ),
        data: (data) => {
          const topIndexers = data?.indexerPrograms as GetTopIndexers_indexerPrograms[];

          if (!topIndexers) {
            return <Typography>{t('topIndexers.nonData')}</Typography>;
          }
          return <TopIndexerList indexers={topIndexers} />;
        },
      })}
    </div>
  );
};
