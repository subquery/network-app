// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect, useState } from 'react';
import { BsArrowDownSquareFill, BsLifePreserver } from 'react-icons/bs';
import { useNavigate } from 'react-router';
import { WalletRoute } from '@components';
import { useSQToken } from '@containers';
import { CrossChainMessenger } from '@eth-optimism/sdk/src/cross-chain-messenger';
import { publicClientToProvider, useEthersSigner } from '@hooks/useEthersProvider';
import { Footer, openNotification, Spinner, Typography } from '@subql/components';
import mainnetJSON from '@subql/contract-sdk/publish/mainnet.json';
import testnetJSON from '@subql/contract-sdk/publish/testnet.json';
import { formatEther } from '@subql/react-hooks';
import { Button, Input, Tabs } from 'antd';
import { parseEther } from 'ethers/lib/utils';
import { base, baseSepolia } from 'viem/chains';
import { mainnet, sepolia, usePublicClient } from 'wagmi';

import styles from './index.module.less';

const l1Chain = import.meta.env.VITE_NETWORK === 'testnet' ? sepolia : mainnet;
const l2Chain = import.meta.env.VITE_NETWORK === 'testnet' ? baseSepolia : base;

const l1ContractTokenAddress =
  import.meta.env.VITE_NETWORK === 'testnet' ? testnetJSON.root.SQToken.address : mainnetJSON.root.SQToken.address;
const l2ContractTokenAddress =
  import.meta.env.VITE_NETWORK === 'testnet'
    ? testnetJSON.child.L2SQToken.address
    : mainnetJSON.child.L2SQToken.address;

const Bridge: FC = () => {
  const { ethSqtBalance } = useSQToken();
  const { signer } = useEthersSigner();
  const navigate = useNavigate();
  const [val, setVal] = useState('0');
  const [loading, setLoading] = useState(false);
  const [crossChainMessengerIns, setCrossChainMessengerIns] = useState<CrossChainMessenger>();
  const publicClient = usePublicClient({ chainId: l2Chain.id });

  const initCrossChainMessenger = async () => {
    if (!signer) return;

    const newCrossChainMessenger = new CrossChainMessenger({
      l1ChainId: l1Chain.id,
      l2ChainId: l2Chain.id,
      l1SignerOrProvider: signer,
      l2SignerOrProvider: publicClientToProvider(publicClient),
    });

    setCrossChainMessengerIns(newCrossChainMessenger);
  };

  const depositToken = async () => {
    if (!crossChainMessengerIns) return;

    try {
      setLoading(true);
      const amount = parseEther(val);

      openNotification({
        type: 'info',
        description: 'Starting bridge process, please wait...',
        duration: 5,
      });
      const depositApproveTx = await crossChainMessengerIns.approveERC20(
        l1ContractTokenAddress,
        l2ContractTokenAddress,
        amount,
      );
      openNotification({
        type: 'info',
        description: 'Approve success, please wait...',
        duration: 3,
      });
      await depositApproveTx.wait();

      const depositTx = await crossChainMessengerIns.depositERC20(
        l1ContractTokenAddress,
        l2ContractTokenAddress,
        amount,
      );
      await depositTx.wait();
      await ethSqtBalance.refetch();
      navigate('/bridge/success');
    } catch (e: any) {
      console.error(e);
      openNotification({
        type: 'error',
        description: e.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initCrossChainMessenger();
  }, [signer]);

  return (
    <WalletRoute
      element={
        <div className={styles.bridgeOutter}>
          <div className={styles.bridge}>
            <Typography variant="h4" weight={600}>
              Bridge
            </Typography>

            <Typography type="secondary" variant="medium" style={{ width: 421, textAlign: 'center' }}>
              SubQuery mainnet has launched, you can now bridge your SQT from Ethereum to Base to access the SubQuery
              Network.
            </Typography>

            <Tabs
              className={styles.bridgeTabs}
              items={[
                {
                  label: 'ETH -> BASE',
                  key: 'ethToBase',
                },
              ]}
            ></Tabs>

            <div className={styles.bridgeContent}>
              <div className="col-flex" style={{ alignItems: 'center', gap: 8 }}>
                <Typography variant="small" type="secondary">
                  FREE SQT
                </Typography>
                <Typography weight={500}>
                  {ethSqtBalance.result.loading ? (
                    <Spinner size={10}></Spinner>
                  ) : (
                    formatEther(ethSqtBalance.result.data || 0, 4)
                  )}{' '}
                  SQT
                </Typography>
              </div>
              <div className={styles.smallCard}>
                <div className={styles.top}>
                  <img src="/static/eth.png" alt=""></img>
                  SQT
                </div>

                <div className={styles.bottom}>
                  <Input
                    className={styles.input}
                    max={formatEther(ethSqtBalance.result.data || 0, 4)}
                    value={val}
                    onChange={(newVal) => {
                      const numericValue = newVal.target.value.replace(/[^0-9.]/g, '');
                      setVal(numericValue);
                    }}
                  ></Input>
                </div>
              </div>
              <BsArrowDownSquareFill style={{ margin: '16px 0', color: 'var(--sq-gray600)', fontSize: 24 }} />
              <div className={styles.smallCard}>
                <div className={styles.top}>
                  <img src="/static/base.png" alt=""></img>
                  SQT
                </div>

                <div className={styles.bottom}>
                  <Typography variant="large" weight={600} type="secondary">
                    {val || '0'}
                  </Typography>
                </div>
              </div>

              <div className="col-flex" style={{ alignItems: 'center' }}>
                <Typography type="secondary" variant="small">
                  Transfer time: A few minutes
                </Typography>
                {/* <Typography type="secondary" variant="small">
              Network fee (est.): 0.000000066 ETH ($0.000194 USD)
            </Typography> */}
              </div>

              <Button
                type="primary"
                size="large"
                shape="round"
                style={{ width: '100%' }}
                onClick={depositToken}
                loading={loading}
                disabled={!val || val === '0'}
              >
                Start Bridge
              </Button>

              <Typography type="secondary" style={{ display: 'flex', alignItems: 'center', gap: 8 }} variant="medium">
                <BsLifePreserver />
                <div>
                  Need help? please message #network-bridge-support on
                  <a href="https://discord.com/invite/subquery"> Discord</a>
                </div>
              </Typography>
            </div>
          </div>
          <Footer simple></Footer>
        </div>
      }
    ></WalletRoute>
  );
};
export default Bridge;
