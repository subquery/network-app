// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Space } from 'antd';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { COLORS } from '../../utils';
import { AppTypography } from '../Typography';

type Props = {
  desc: string;
  icon?: React.ReactNode;
};

export const Description: React.VFC<Props> = ({ desc, icon }) => {
  return (
    <Space>
      {icon ?? <AiOutlineInfoCircle className="flex" color={COLORS.primary} />}
      <AppTypography>{desc}</AppTypography>
    </Space>
  );
};
