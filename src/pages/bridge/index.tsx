// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect, useState } from 'react';
import { BsArrowDownSquareFill, BsLifePreserver } from 'react-icons/bs';
import { useNavigate } from 'react-router';
import { gql, useQuery } from '@apollo/client';
import { WalletRoute } from '@components';
import { useSQToken } from '@containers';
import { l1Chain, l2Chain } from '@containers/Web3';
import { CrossChainMessenger } from '@eth-optimism/sdk/src/cross-chain-messenger';
import { MessageStatus } from '@eth-optimism/sdk/src/interfaces/types';
import { publicClientToProvider, useEthersSigner } from '@hooks/useEthersProvider';
import { Footer, Modal, openNotification, Spinner, Steps, Typography } from '@subql/components';
import mainnetJSON from '@subql/contract-sdk/publish/mainnet.json';
import testnetJSON from '@subql/contract-sdk/publish/testnet.json';
import { formatEther, formatSQT } from '@subql/react-hooks';
import { makeCacheKey } from '@utils/limitation';
import { useInterval } from 'ahooks';
import { Button, InputNumber, Tabs } from 'antd';
import { clsx } from 'clsx';
import { ethers } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import { useAccount, useNetwork, usePublicClient, useSwitchNetwork } from 'wagmi';

import styles from './index.module.less';

const l1ContractTokenAddress =
  import.meta.env.VITE_NETWORK === 'testnet' ? testnetJSON.root.SQToken.address : mainnetJSON.root.SQToken.address;
const l2ContractTokenAddress =
  import.meta.env.VITE_NETWORK === 'testnet'
    ? testnetJSON.child.L2SQToken.address
    : mainnetJSON.child.L2SQToken.address;

export interface WithdrawsRecord {
  withdraws: {
    nodes: {
      sender: string;
      txHash: string;
      nodeId: string;
      id: string;
      createAt: Date;
      blockheight: number;
      amount: string;
    }[];
  };
}

const btnMsgs = {
  [MessageStatus.READY_TO_PROVE]: 'Approve withdraw',
  [MessageStatus.READY_FOR_RELAY]: 'Finalize withdraw',
  [MessageStatus.STATE_ROOT_NOT_PUBLISHED]: 'State root not published',
  [MessageStatus.RELAYED]: 'Finished',

  // fallback
  [MessageStatus.FAILED_L1_TO_L2_MESSAGE]: 'Failed l1 to l2 message',
  [MessageStatus.IN_CHALLENGE_PERIOD]: 'In challenge period',
  [MessageStatus.UNCONFIRMED_L1_TO_L2_MESSAGE]: 'Unconfirmed l1 to l2 message',
};

const descMsgs = {
  [MessageStatus.READY_TO_PROVE]: 'Ready to prove, please do it as soon as possiable',
  [MessageStatus.READY_FOR_RELAY]: 'Ready to withdraw',
  [MessageStatus.STATE_ROOT_NOT_PUBLISHED]: 'State root not published',
  [MessageStatus.RELAYED]: 'You must wait for a 7 day withdraw period required by OP stack.',

  // fallback
  [MessageStatus.FAILED_L1_TO_L2_MESSAGE]: 'Failed l1 to l2 message',
  [MessageStatus.IN_CHALLENGE_PERIOD]: 'In challenge period',
  [MessageStatus.UNCONFIRMED_L1_TO_L2_MESSAGE]: 'Unconfirmed l1 to l2 message',
};

const Bridge: FC = () => {
  const { ethSqtBalance, balance } = useSQToken();
  const { signer } = useEthersSigner();
  const { chain } = useNetwork();
  const { address: account } = useAccount();

  const navigate = useNavigate();
  const [val, setVal] = useState('0');
  const [loading, setLoading] = useState(false);
  const [startL2BridgeLoading, setStartL2BridgeLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [crossChainMessengerIns, setCrossChainMessengerIns] = useState<CrossChainMessenger>();
  const [pendingActionStatus, setPendingActionStatus] = useState<{ [key: string]: { status: MessageStatus } }>({});
  const publicClientL1 = usePublicClient({ chainId: l1Chain.id });
  const { switchNetwork } = useSwitchNetwork();

  const [currentTab, setCurrentTab] = useState<'ethToBase' | 'baseToEth'>('ethToBase');

  const withdrawsRecord = useQuery<WithdrawsRecord>(
    gql`
      query getWithdrawsRecord($sender: String!) {
        withdraws(filter: { sender: { equalTo: $sender } }) {
          nodes {
            sender
            txHash
            nodeId
            id
            createAt
            blockheight
            amount
          }
        }
      }
    `,
    {
      variables: {
        sender: account,
      },
      fetchPolicy: 'network-only',
    },
  );

  const initCrossChainMessenger = async () => {
    if (!signer) return;
    const l2Provider = new ethers.providers.JsonRpcProvider(l2Chain.rpcUrls.public.http[0]);
    const newCrossChainMessenger = new CrossChainMessenger({
      l1ChainId: l1Chain.id,
      l2ChainId: l2Chain.id,
      l1SignerOrProvider:
        signer.provider.network.chainId === l1Chain.id ? signer : publicClientToProvider(publicClientL1),
      l2SignerOrProvider: signer.provider.network.chainId === l2Chain.id ? signer : l2Provider,
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

    const _withdrawStart = async () => {
      try {
        setStartL2BridgeLoading(true);
        const amount = parseEther(val);
        const withdrawTx = await crossChainMessengerIns.withdrawERC20(
          l1ContractTokenAddress,
          l2ContractTokenAddress,
          amount,
        );
        await withdrawTx.wait();
        openNotification({
          type: 'success',
          description:
            'Withdraw request success, please wait L1 status changed, you can check the status at below list.',
          duration: 5,
        });
      } catch (e: any) {
        console.error(e);
        openNotification({
          type: 'error',
          description: e.message,
        });
      } finally {
        setStartL2BridgeLoading(false);
      }
    };

    Modal.confirm({
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
      onOk: async () => {
        await _withdrawStart();
      },
    });
  };

  const fetchPendingActionStatus = async () => {
    if (!crossChainMessengerIns || !account) return;

    const pendingActionStatus: { [key: string]: { status: MessageStatus } } = {};
    for (const item of withdrawsRecord.data?.withdraws.nodes || []) {
      const status = await crossChainMessengerIns.getMessageStatus(item.txHash);
      pendingActionStatus[item.txHash] = { status };
    }
    setPendingActionStatus(pendingActionStatus);
  };

  const withdrawApproveOrFinalize = async (txHash: string) => {
    if (!crossChainMessengerIns) return;
    try {
      setWithdrawLoading(true);
      if (pendingActionStatus[txHash]?.status === MessageStatus.READY_TO_PROVE) {
        try {
          const approveTx = await crossChainMessengerIns.proveMessage(txHash);
          await approveTx.wait();
          openNotification({
            type: 'success',
            description: 'Approve success, please wait...',
            duration: 3,
          });
        } catch (e: any) {
          console.error(e);
          openNotification({
            type: 'error',
            description: e.message,
          });
        }
      }

      if (pendingActionStatus[txHash]?.status === MessageStatus.READY_FOR_RELAY) {
        try {
          const finalizeTx = await crossChainMessengerIns.finalizeMessage(txHash);
          await finalizeTx.wait();
          openNotification({
            type: 'success',
            description: 'Finalize success, You must wait for a 7 day withdraw period required by OP stack.',
            duration: 3,
          });
        } catch (e: any) {
          console.error(e);
          openNotification({
            type: 'error',
            description: e.message,
          });
        }
      }
    } finally {
      setWithdrawLoading(false);
    }
  };

  useEffect(() => {
    initCrossChainMessenger();
  }, [signer]);

  useEffect(() => {
    fetchPendingActionStatus();
  }, [withdrawsRecord.data?.withdraws.nodes, crossChainMessengerIns]);

  useEffect(() => {
    fetchPendingActionStatus();
  }, [chain?.id]);

  useInterval(async () => {
    await withdrawsRecord.refetch();
    fetchPendingActionStatus();
  }, 10000);

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
              <>
                <div className={styles.bridgeContent}>
                  <div className="col-flex" style={{ alignItems: 'center', gap: 8 }}>
                    <Typography variant="medium" type="secondary" style={{ textAlign: 'center' }}>
                      OP stack and Base requires that any bridging to Ethereum requires a 7 day withdraw period. If you
                      do not want to wait for the required 7 days, please consider a{' '}
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
                      {balance.result.loading ? (
                        <Spinner size={10}></Spinner>
                      ) : (
                        formatEther(balance.result.data || 0, 4)
                      )}{' '}
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
                    loading={startL2BridgeLoading}
                    disabled={!val || val === '0'}
                  >
                    {chain?.id !== l2Chain.id ? 'Switch to Base' : 'Start Bridge'}
                  </Button>

                  <Typography
                    type="secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    variant="medium"
                  >
                    <BsLifePreserver />
                    <div>
                      Need help? please message #network-bridge-support on
                      <a href="https://discord.com/invite/subquery"> Discord</a>
                    </div>
                  </Typography>
                </div>

                {withdrawsRecord.data?.withdraws.nodes.length ? (
                  <div className="col-flex" style={{ alignItems: 'center', marginTop: 22, gap: 16, width: '100%' }}>
                    <Typography variant="h5" weight={600}>
                      Pending Bridge Actions
                    </Typography>

                    {withdrawsRecord.data?.withdraws.nodes
                      .filter((i) => pendingActionStatus[i.txHash]?.status !== MessageStatus.RELAYED)
                      .map((item) => {
                        const status = pendingActionStatus[item.txHash]?.status;
                        const btnMsg = btnMsgs[status] || 'Unknown';
                        const desc = descMsgs[status] || 'Unknown';
                        const isL1Chain = chain?.id === l1Chain.id;
                        const disable =
                          isL1Chain &&
                          status !== MessageStatus.READY_TO_PROVE &&
                          status !== MessageStatus.READY_FOR_RELAY;
                        return (
                          <div className={styles.pendingAction} key={item.id}>
                            <Typography>
                              Bridge for {Number(formatSQT(item.amount)).toLocaleString()} SQT from Base {'->'} Ethereum{' '}
                            </Typography>
                            <Typography type="secondary" variant="small">
                              {desc}
                            </Typography>

                            <Button
                              type="primary"
                              size="large"
                              shape="round"
                              style={{ width: '100%' }}
                              loading={withdrawLoading}
                              disabled={disable}
                              onClick={() => {
                                if (chain?.id !== l1Chain.id) {
                                  switchNetwork?.(l1Chain.id);
                                  return;
                                }
                                withdrawApproveOrFinalize(item.txHash);
                              }}
                            >
                              {chain?.id !== l1Chain.id ? 'Switch to Ethereum' : btnMsg}
                            </Button>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  ''
                )}
              </>
            )}
          </div>
          <Footer simple></Footer>
        </div>
      }
    ></WalletRoute>
  );
};
export default Bridge;
