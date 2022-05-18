// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Typography } from '@subql/react-ui';
import { Input, InputProps } from 'antd';
import * as React from 'react';
import styles from './SearchAddress.module.css';

type Props = {
  onSearch: (input: string) => void;
  searchResult?: string;
  loading?: boolean;
} & InputProps;

export const SearchAddress: React.FC<Props> = ({ onSearch, searchResult, ...inputProps }) => {
  return (
    <div className={styles.indexerSearch}>
      <Input.Search
        placeholder="Search by address..."
        allowClear
        onSearch={(value) => onSearch(value)}
        enterButton
        {...inputProps}
      />
      {searchResult && (
        <Typography variant="small" className="grayText">
          {searchResult}
        </Typography>
      )}
    </div>
  );
};
