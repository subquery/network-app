// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC } from 'react';
import WarningOutlined from '@ant-design/icons/WarningOutlined';
import { Typography } from '@subql/components';
import { Tag, Tooltip } from 'antd';

const UnsafeWarn: FC = () => {
  return (
    <Tooltip
      placement="right"
      overlayInnerStyle={{
        width: 350,
      }}
      title={
        <div>
          <Typography variant="medium" style={{ color: '#fff' }}>
            SubQuery can’t guarantee that this project is deterministic, which means it is not entirely safe.
          </Typography>

          <Typography variant="medium" style={{ color: '#fff', margin: '20px 0' }}>
            This means that two indexers are not guaranteed to index exactly the same data when indexing this project.
          </Typography>
          <Typography variant="medium" style={{ color: '#fff' }}>
            In most cases this means the project is making an external API call, you can check the source code or ask
            the developer about what this project is doing. Making agreements or plans with unsafe projects is fine, but
            you can’t hold Indexers accountable for inconsistencies in the data that they index (unless the differences
            are clearly caused in malicious indexers)
          </Typography>
        </div>
      }
    >
      <Tag
        style={{
          borderColor: 'rgba(248, 124, 79, 0.50)',
          background: 'rgba(248, 124, 79, 0.08)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <WarningOutlined style={{ color: 'var(--sq-warning)', marginRight: 4 }} />
        <Typography
          variant="small"
          style={{
            color: 'var(--sq-warning)',
          }}
        >
          Non-deterministic
        </Typography>
      </Tag>
    </Tooltip>
  );
};
export default UnsafeWarn;
