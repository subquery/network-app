// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { truncFormatEtherStr, TOKEN } from '../../utils';
import { TableText } from '../TableText';

export const TokenAmount: React.VFC<{ value: string | number | undefined; className?: string }> = ({
  value,
  className,
}) => {
  if (!value) return <TableText content={'-'} className={className} />;

  const truncatedValue = truncFormatEtherStr(value.toString());

  return (
    <TableText tooltip={`${value} ${TOKEN}`} className={className}>
      {truncatedValue} {TOKEN}
    </TableText>
  );
};
