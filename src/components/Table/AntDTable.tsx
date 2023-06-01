// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

/**
 * NOTE:
 * Use graphql Offset and antD table will have empty display issue at larger pagination
 * As the data always be filled start from the first page of antTable
 */

import * as React from 'react';
import { Pagination, PaginationProps, Table, TableProps } from 'antd';
import clsx from 'clsx';

interface AntDTableProps {
  customPagination?: boolean;
  tableProps: any; // TODO: move to TableProps
  paginationProps?: PaginationProps;
}

export const AntDTable: React.FC<AntDTableProps> = ({ customPagination = false, paginationProps, tableProps }) => {
  if (!customPagination) {
    return <Table {...paginationProps} {...tableProps} />;
  }

  return (
    <>
      <Table
        pagination={false} // offset function get partial data but antD fill from page 1
        {...tableProps}
      />
      <Pagination
        className={clsx('flex-end', 'verticalMargin')}
        defaultCurrent={1}
        showSizeChanger={false}
        pageSize={10} // must be the same as useQuery first field
        {...paginationProps}
      />
    </>
  );
};
