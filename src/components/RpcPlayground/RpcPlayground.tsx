// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useMemo, useState } from 'react';
import { Typography } from '@subql/components';
import { getAuthReqHeader } from '@utils';
import { Button, Input } from 'antd';
import { fetchJson } from 'ethers/lib/utils';

import styles from './index.module.less';

interface IProps {
  url?: string;
  trailToken: string;
}

const RpcPlayground: FC<IProps> = ({ url, trailToken }) => {
  const [val, setVal] = useState('');
  const [loading, setLoading] = useState(false);
  const enteredRows = useMemo(() => {
    return val.split('\n').length;
  }, [val]);

  const [responseData, setResponseData] = useState('');

  const fetchRpc = async () => {
    if (!url) return;
    try {
      setLoading(true);
      const res = await fetchJson(
        {
          url,
          headers: {
            ...getAuthReqHeader(trailToken),
          },
        },
        val,
      );

      setResponseData(JSON.stringify(res));
    } catch (e: any) {
      setResponseData(`${e.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.rpcPlayground}>
      <div className={styles.rpcPlaygroundEditor}>
        <Typography style={{ color: '#fff', marginBottom: 8 }} weight={500}>
          Request
        </Typography>
        <Input.TextArea
          rows={30}
          value={val}
          onChange={(e) => {
            setVal(e.target.value);
          }}
          placeholder="JSON RPC playground is a simple tool to help you test queries, click to enter you requests."
        ></Input.TextArea>

        <Button
          loading={loading}
          shape="round"
          size="large"
          type="primary"
          style={{ position: 'absolute', right: 16, bottom: 32 }}
          onClick={() => {
            fetchRpc();
          }}
        >
          Send Request
        </Button>
      </div>

      <div className={styles.rpcPlaygroundResponse}>
        <Typography style={{ color: '#fff', marginBottom: 8 }} weight={500}>
          Response
        </Typography>
        <div style={{ overflowWrap: 'anywhere', wordBreak: 'break-all', color: 'var(--sq-gray500)' }}>
          {responseData}
        </div>
      </div>
    </div>
  );
};
export default RpcPlayground;
