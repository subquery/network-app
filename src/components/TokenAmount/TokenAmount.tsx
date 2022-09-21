// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { truncFormatEtherStr, TOKEN } from '../../utils';
import { TableText } from '../TableText';

export const TokenAmount: React.VFC<{ value: string | undefined }> = ({ value }) => {
  if (!value) return <TableText content={'-'} />;

  const truncatedValue = truncFormatEtherStr(value.toString());

  return (
    <TableText tooltip={`${value} ${TOKEN}`}>
      {truncatedValue} {TOKEN}
    </TableText>
  );
};
