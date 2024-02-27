// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect, useState } from 'react';
import { BsArrowDownSquareFill, BsLifePreserver } from 'react-icons/bs';
import { useNavigate } from 'react-router';
import { WalletRoute } from '@components';
import { useSQToken } from '@containers';
import { l1Chain, l2Chain } from '@containers/Web3';
import { CrossChainMessenger } from '@eth-optimism/sdk/src/cross-chain-messenger';
import { publicClientToProvider, useEthersSigner } from '@hooks/useEthersProvider';
import { Footer, Modal, openNotification, Spinner, Steps, Typography } from '@subql/components';
import mainnetJSON from '@subql/contract-sdk/publish/mainnet.json';
import testnetJSON from '@subql/contract-sdk/publish/testnet.json';
import { formatEther } from '@subql/react-hooks';
import { Button, InputNumber, Tabs } from 'antd';
import { clsx } from 'clsx';
import { parseEther } from 'ethers/lib/utils';
import { useNetwork, usePublicClient, useSwitchNetwork } from 'wagmi';

import styles from './index.module.less';

const l1ContractTokenAddress =
  import.meta.env.VITE_NETWORK === 'testnet' ? testnetJSON.root.SQToken.address : mainnetJSON.root.SQToken.address;
const l2ContractTokenAddress =
  import.meta.env.VITE_NETWORK === 'testnet'
    ? testnetJSON.child.L2SQToken.address
    : mainnetJSON.child.L2SQToken.address;

const Bridge: FC = () => {
  const { ethSqtBalance, balance } = useSQToken();
  const { signer } = useEthersSigner();
  const { chain } = useNetwork();

  const navigate = useNavigate();
  const [val, setVal] = useState('0');
  const [loading, setLoading] = useState(false);
  const [crossChainMessengerIns, setCrossChainMessengerIns] = useState<CrossChainMessenger>();
  const publicClient = usePublicClient({ chainId: l2Chain.id });
  const publicClientL1 = usePublicClient({ chainId: l1Chain.id });
  const { switchNetwork } = useSwitchNetwork();

  const [currentTab, setCurrentTab] = useState<'ethToBase' | 'baseToEth'>('ethToBase');

  const initCrossChainMessenger = async () => {
    if (!signer) return;

    const newCrossChainMessenger = new CrossChainMessenger({
      l1ChainId: l1Chain.id,
      l2ChainId: l2Chain.id,
      l1SignerOrProvider:
        signer.provider.network.chainId === l1Chain.id ? signer : publicClientToProvider(publicClientL1),
      l2SignerOrProvider:
        signer.provider.network.chainId === l2Chain.id ? signer : publicClientToProvider(publicClient),
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

  const withdrawStart = async () => {
    if (!crossChainMessengerIns) return;
    await Modal.confirm({
      width: 572,
      className: styles.confirmModal,
      title: 'Confirm Bridge',
      closable: true,
      icon: null,
      content: (
        <div className="col-flex" style={{ gap: 24 }}>
          <div className="flex" style={{ width: '100%', justifyContent: 'space-between' }}>
            <div className={clsx(styles.smallCard, 'col-flex')} style={{ gap: 8 }}>
              <div className={styles.bottom}>
                <Typography variant="large" weight={600} type="secondary">
                  {val || '0'}
                </Typography>
              </div>
              <div className={clsx(styles.top, 'flex')} style={{ gap: 8 }}>
                <img src="/static/base.png" alt=""></img>
                SQT
              </div>
            </div>
            <BsArrowDownSquareFill style={{ color: 'var(--sq-gray600)', fontSize: 24, transform: 'rotate(-90deg)' }} />
            <div className={clsx(styles.smallCard, 'col-flex')} style={{ gap: 8 }}>
              <div className={styles.bottom}>
                <Typography variant="large" weight={600} type="secondary">
                  {val || '0'}
                </Typography>
              </div>
              <div className={clsx(styles.top, 'flex')} style={{ gap: 8 }}>
                <img src="/static/eth.png" alt=""></img>
                SQT
              </div>
            </div>
          </div>
          <Typography variant="medium" type="secondary">
            OP stack and Base requires that any bridging to Ethereum requires a 7 day withdraw period. If you do not
            want to wait for the required 7 days, please consider a{' '}
            <a href="https://www.base.org/ecosystem?tag=bridge" target="_blank" rel="noreferrer">
              third party bridge
            </a>
            .
          </Typography>
        </div>
      ),
      cancelButtonProps: {
        style: { display: 'none' },
      },
      okText: `Confirm Bridge for ${(+val).toLocaleString()} SQT`,
      okButtonProps: {
        shape: 'round',
      },
    });
    try {
      setLoading(true);
      const amount = parseEther(val);
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
              activeKey={currentTab}
              onTabClick={(key) => {
                setCurrentTab(key as 'ethToBase' | 'baseToEth');
                setVal('0');
              }}
              items={[
                {
                  label: 'Ethereum -> Base',
                  key: 'ethToBase',
                },
                {
                  label: 'Base -> Ethereum',
                  key: 'baseToEth',
                },
              ]}
            ></Tabs>

            {currentTab === 'ethToBase' && (
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
                    <InputNumber
                      className={styles.input}
                      max={formatEther(ethSqtBalance.result.data || 0, 4)}
                      controls={false}
                      value={val}
                      onChange={(newVal) => {
                        setVal(newVal?.toString() || '');
                      }}
                    ></InputNumber>
                  </div>
                </div>
                <BsArrowDownSquareFill style={{ color: 'var(--sq-gray600)', fontSize: 24 }} />
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
                </div>

                <Button
                  type="primary"
                  size="large"
                  shape="round"
                  style={{ width: '100%' }}
                  onClick={
                    chain?.id !== l1Chain.id
                      ? () => {
                          switchNetwork?.(l1Chain.id);
                        }
                      : depositToken
                  }
                  loading={loading}
                  disabled={!val || val === '0'}
                >
                  {chain?.id !== l1Chain.id ? 'Switch to Ethereum' : 'Start Bridge'}
                </Button>

                <Typography type="secondary" style={{ display: 'flex', alignItems: 'center', gap: 8 }} variant="medium">
                  <BsLifePreserver />
                  <div>
                    Need help? please message #network-bridge-support on
                    <a href="https://discord.com/invite/subquery"> Discord</a>
                  </div>
                </Typography>
              </div>
            )}

            {currentTab === 'baseToEth' && (
              <div className={styles.bridgeContent}>
                <div className="col-flex" style={{ alignItems: 'center', gap: 8 }}>
                  <Typography variant="medium" type="secondary" style={{ textAlign: 'center' }}>
                    OP stack and Base requires that any bridging to Ethereum requires a 7 day withdraw period. If you do
                    not want to wait for the required 7 days, please consider a{' '}
                    <a href="https://www.base.org/ecosystem?tag=bridge" target="_blank" rel="noreferrer">
                      third party bridge
                    </a>
                    .
                  </Typography>

                  <Steps
                    steps={[
                      {
                        title: 'Start on Base',
                      },
                      {
                        title: 'Confirm on Ethereum',
                      },
                      {
                        title: 'Withdraw',
                      },
                    ]}
                    current={0}
                    style={{ margin: '14px 0' }}
                  ></Steps>

                  <Typography variant="small" type="secondary">
                    FREE SQT
                  </Typography>
                  <Typography weight={500}>
                    {balance.result.loading ? <Spinner size={10}></Spinner> : formatEther(balance.result.data || 0, 4)}{' '}
                    SQT
                  </Typography>
                </div>
                <div className={styles.smallCard}>
                  <div className={styles.top}>
                    <img src="/static/base.png" alt=""></img>
                    SQT
                  </div>

                  <div className={styles.bottom}>
                    <InputNumber
                      className={styles.input}
                      max={formatEther(balance.result.data || 0, 4)}
                      value={val}
                      controls={false}
                      onChange={(newVal) => {
                        setVal(newVal?.toString() || '');
                      }}
                    ></InputNumber>
                  </div>
                </div>
                <BsArrowDownSquareFill style={{ color: 'var(--sq-gray600)', fontSize: 24 }} />
                <div className={styles.smallCard}>
                  <div className={styles.top}>
                    <img src="/static/eth.png" alt=""></img>
                    SQT
                  </div>

                  <div className={styles.bottom}>
                    <Typography variant="large" weight={600} type="secondary">
                      {val || '0'}
                    </Typography>
                  </div>
                </div>

                <Button
                  type="primary"
                  size="large"
                  shape="round"
                  style={{ width: '100%' }}
                  onClick={
                    chain?.id !== l2Chain.id
                      ? () => {
                          switchNetwork?.(l2Chain.id);
                        }
                      : withdrawStart
                  }
                  loading={loading}
                  disabled={!val || val === '0'}
                >
                  {chain?.id !== l2Chain.id ? 'Switch to Base' : 'Start Bridge'}
                </Button>

                <Typography type="secondary" style={{ display: 'flex', alignItems: 'center', gap: 8 }} variant="medium">
                  <BsLifePreserver />
                  <div>
                    Need help? please message #network-bridge-support on
                    <a href="https://discord.com/invite/subquery"> Discord</a>
                  </div>
                </Typography>
              </div>
            )}
          </div>
          <Footer simple></Footer>
        </div>
      }
    ></WalletRoute>
  );
};
export default Bridge;
