// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useMemo, useState } from 'react';
import { Manifest, RPCFAMILY } from '@hooks/useGetDeploymentManifest';
import { Typography } from '@subql/components';
import { getAuthReqHeader } from '@utils';
import { Button, Input } from 'antd';
import { fetchJson } from 'ethers/lib/utils';

import styles from './index.module.less';

interface IProps {
  url?: string;
  trailToken: string;
  rpcFamily?: Manifest['rpcFamily'];
}

export const playgroundValidator = {
  [RPCFAMILY.EVM]: async (val: string) => {
    try {
      const valCopy = JSON.parse(val) as { [key: string]: unknown };
      const requestFields = ['jsonrpc', 'id', 'method', 'params'];

      for (const field of requestFields) {
        if (!Object.hasOwn(valCopy, field)) {
          return Promise.reject(new Error(`Must have field "${field}"`));
        }
      }
    } catch (e) {
      return Promise.reject(new Error('Please enter a valid json'));
    }
  },
  [RPCFAMILY.SUBSTRATE]: async (val: string) => {
    try {
      JSON.parse(val) as { [key: string]: unknown };
    } catch (e) {
      return Promise.reject(new Error('Please enter a valid json'));
    }
  },
};

export const playgroundPlaceholder: {
  [key: string]: string;
} = {
  [RPCFAMILY.EVM]: `Example: {"jsonrpc":"2.0","id": 1, "method":"eth_blockNumber","params":[]}`,
  default: 'JSON RPC playground is a simple tool to help you test queries, click to enter you requests.',
};

const RpcPlayground: FC<IProps> = ({ url, trailToken, rpcFamily }) => {
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
      if (rpcFamily) {
        const [firstFamily] = rpcFamily;
        await playgroundValidator[firstFamily.toLowerCase() as RPCFAMILY]?.(val);
      }
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        <div style={{ display: 'flex', gap: 8 }}>
          <div className={styles.rows}>
            {new Array(enteredRows).fill(0).map((_, index) => (
              <span key={index}>{index + 1}</span>
            ))}
          </div>
          <Input.TextArea
            rows={30}
            value={val}
            onChange={(e) => {
              setVal(e.target.value);
            }}
            style={{ resize: 'none' }}
            placeholder={playgroundPlaceholder[rpcFamily?.[0] || 'default']}
          ></Input.TextArea>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'sticky', bottom: 32 }}>
          <Button
            loading={loading}
            shape="round"
            size="large"
            type="primary"
            onClick={() => {
              fetchRpc();
            }}
          >
            Send Request
          </Button>
        </div>
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
