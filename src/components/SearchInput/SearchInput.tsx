// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Typography } from '@subql/components';
import { Input, InputProps } from 'antd';

type Props = {
  onSearch?: (input: string) => void;
  searchResult?: string;
  placeholder?: string;
  loading?: boolean;
  emptyResult?: boolean;
} & InputProps;

export const SearchInput: React.FC<Props> = ({
  placeholder,
  loading,
  onSearch,
  emptyResult,
  searchResult,
  ...inputProps
}) => {
  const [searchIndexer, setSearchIndexer] = React.useState<string | undefined>();
  const [searchIndexerResult, setSearchIndexerResult] = React.useState<string | undefined>();
  const [searchingIndexer, setSearchingIndexer] = React.useState<boolean>();

  React.useEffect(() => {
    setSearchingIndexer(loading);
    if (emptyResult && searchIndexer && !loading) {
      setSearchIndexerResult('No search result.');
    } else {
      setSearchIndexerResult(undefined);
    }
  }, [searchIndexer, emptyResult, loading]);

  return (
    <div className="fullWidth">
      <Input.Search
        placeholder={placeholder || 'Search by address...'}
        size="large"
        allowClear
        onSearch={(value) => {
          setSearchIndexer(value);
          onSearch && onSearch(value);
        }}
        loading={loading || searchingIndexer}
        enterButton
        {...inputProps}
      />
      {searchIndexerResult && (
        <Typography variant="small" className="grayText">
          {searchIndexerResult}
        </Typography>
      )}
    </div>
  );
};
