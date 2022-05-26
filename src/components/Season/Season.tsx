// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Progress, Typography } from 'antd';
import styles from './Season.module.css';
const { Title, Paragraph } = Typography;
export const Season: React.VFC = () => {
  return (
    <div className={styles.profile}>
      <div className={styles.description}>
        <Typography>
          <Paragraph>Current Season is ended</Paragraph>
          <Title>1h 3m 2s</Title>
        </Typography>
      </div>
      <div className={styles.progress}>
        <Progress
          strokeColor={{
            '0%': '#4289DE',
            '100%': '#EA4D8A',
          }}
          percent={30}
          status="active"
        />
      </div>
    </div>
  );
};
