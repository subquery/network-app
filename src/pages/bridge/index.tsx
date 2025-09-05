// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { BsArrowDownSquareFill, BsLifePreserver } from 'react-icons/bs';
import { useNavigate } from 'react-router';
import { gql, useQuery } from '@apollo/client';
import { WalletRoute } from '@components/WalletRoute';
import { useSQToken } from '@containers';
import { l1Chain, l2Chain } from '@containers/Web3';
import { type CrossChainMessenger } from '@eth-optimism/sdk/src/cross-chain-messenger';
import { MessageStatus } from '@eth-optimism/sdk/src/interfaces/types';
import { publicClientToProvider, useEthersSigner } from '@hooks/useEthersProvider';
import { Footer, Modal, openNotification, Spinner, Steps, Typography } from '@subql/components';
import mainnetJSON from '@subql/contract-sdk/publish/mainnet.json';
import testnetJSON from '@subql/contract-sdk/publish/testnet.json';
import { formatEther, formatSQT } from '@subql/react-hooks';
import { parseError } from '@utils';
import { makeCacheKey } from '@utils/limitation';
import { useInterval } from 'ahooks';
import { Button, InputNumber, Tabs } from 'antd';
import BigNumber from 'bignumber.js';
import { clsx } from 'clsx';
import dayjs from 'dayjs';
import { ethers } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import localforage from 'localforage';
import { useAccount, usePublicClient, useSwitchChain } from 'wagmi';

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
  [MessageStatus.READY_FOR_RELAY]: 'Withdraw SQT',
  [MessageStatus.STATE_ROOT_NOT_PUBLISHED]: 'State root not published',
  [MessageStatus.RELAYED]: 'Finished, please wait at most 7 days and check in your wallet',

  // fallback
  [MessageStatus.FAILED_L1_TO_L2_MESSAGE]: 'Failed l1 to l2 message',
  [MessageStatus.IN_CHALLENGE_PERIOD]: 'In challenge period',
  [MessageStatus.UNCONFIRMED_L1_TO_L2_MESSAGE]: 'Unconfirmed l1 to l2 message',
};

const descMsgs = {
  [MessageStatus.READY_TO_PROVE]: 'Ready to prove, please do it as soon as possiable',
  [MessageStatus.READY_FOR_RELAY]: 'Ready to withdraw',
  [MessageStatus.STATE_ROOT_NOT_PUBLISHED]: 'State root not published, please wait...',
  [MessageStatus.RELAYED]: 'You must wait for a 7 days withdraw period required by OP stack.',

  // fallback
  [MessageStatus.FAILED_L1_TO_L2_MESSAGE]: 'Failed l1 to l2 message',
  [MessageStatus.IN_CHALLENGE_PERIOD]: 'In challenge period',
  [MessageStatus.UNCONFIRMED_L1_TO_L2_MESSAGE]: 'Unconfirmed l1 to l2 message',
};

const BridgeInner: FC = () => {
  const { ethSqtBalance, balance } = useSQToken();
  const { signer } = useEthersSigner();
  const { address: account, chain } = useAccount();
  const publicClientL1 = usePublicClient({ chainId: l1Chain.id });
  const { switchChainAsync } = useSwitchChain();
  const navigate = useNavigate();
  const withdrawsRecord = useQuery<WithdrawsRecord>(
    gql`
      query getWithdrawsRecord($sender: String!) {
        withdraws(filter: { sender: { equalTo: $sender } }, orderBy: CREATE_AT_DESC) {
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
  const [val, setVal] = useState('0');
  const [loading, setLoading] = useState(false);
  const [startL2BridgeLoading, setStartL2BridgeLoading] = useState(false);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [crossChainMessengerIns, setCrossChainMessengerIns] = useState<CrossChainMessenger>();
  const [pendingActionStatus, setPendingActionStatus] = useState<{
    [key: string]: { status: MessageStatus; startTime?: number };
  }>({});
  const [currentTab, setCurrentTab] = useState<'ethToBase' | 'baseToEth'>('ethToBase');
  // This state is used to prevent the fetchPendingActionStatus function from being called when finalizeMessage is called.
  const shouldFetch = useRef(true);

  const cacheKey = useMemo(() => makeCacheKey(account || '', { prefix: 'pendingActionStatus' }), [account]);

  const sortedWithdrawRecords = useMemo(() => {
    return (
      withdrawsRecord.data?.withdraws.nodes.filter(({ txHash }) => {
        const status = pendingActionStatus[txHash]?.status;
        if (status === MessageStatus.RELAYED) {
          if (pendingActionStatus[txHash].startTime) {
            const durationTime = +dayjs() - (pendingActionStatus[txHash].startTime as number);
            const duration = dayjs.duration(durationTime);
            const maxPeiod = dayjs.duration(7, 'day');
            const leftTime = maxPeiod.subtract(duration);

            if (leftTime.days() === 0 && leftTime.hours() === 0) {
              return false;
            }
          }
        }

        return true;
      }) || []
    );
  }, [pendingActionStatus, withdrawsRecord.data?.withdraws.nodes]);

  const initCrossChainMessenger = async () => {
    if (!signer) return;
    const { CrossChainMessenger } = await import('@eth-optimism/sdk/src/cross-chain-messenger');
    const l2Provider = new ethers.providers.JsonRpcProvider(
      import.meta.env.VITE_SUBQUERY_OFFICIAL_BASE_RPC || l2Chain.rpcUrls.default.http[0],
    );
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

      const approvedAmount = await crossChainMessengerIns.approval(l1ContractTokenAddress, l2ContractTokenAddress);
      if (BigNumber(formatSQT(approvedAmount.toString())).lt(BigNumber(val))) {
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
      }

      const depositTx = await crossChainMessengerIns.depositERC20(
        l1ContractTokenAddress,
        l2ContractTokenAddress,
        amount,
      );
      await depositTx.wait();
      await ethSqtBalance.refetch();
      navigate('/bridge/success');
    } catch (e: any) {
      openNotification({
        type: 'error',
        description: parseError(e.message),
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
        openNotification({
          type: 'error',
          description: parseError(e.message),
        });
      } finally {
        setStartL2BridgeLoading(false);
      }
    };

    Modal.confirm({
      width: 572,
      className: 'confirmModal',
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
            <Typography.Link href="https://www.base.org/ecosystem?tag=bridge" target="_blank" rel="noreferrer">
              third party bridge
            </Typography.Link>
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

    const cachedStorage = await localforage.getItem<{ [key: string]: { status: MessageStatus; startTime?: number } }>(
      cacheKey,
    );
    const filterStatus = (tx: string) => {
      if (!cachedStorage) return true;
      try {
        if (cachedStorage[tx].status === MessageStatus.RELAYED) return false;
        return true;
      } catch (e) {
        return true;
      }
    };
    const sortedWithdrawsRecord = withdrawsRecord.data?.withdraws.nodes.filter((i) => filterStatus(i.txHash));

    const innerPendingActionStatus: { [key: string]: { status: MessageStatus; startTime?: number } } = {};
    for (const item of sortedWithdrawsRecord || []) {
      const status = await crossChainMessengerIns.getMessageStatus(item.txHash);

      innerPendingActionStatus[item.txHash] = { status };
      if (pendingActionStatus[item.txHash]?.startTime) {
        innerPendingActionStatus[item.txHash]['startTime'] = pendingActionStatus[item.txHash].startTime;
      }
    }

    const mergeFetchStatus = () => {
      if (!cachedStorage) return innerPendingActionStatus;

      try {
        return {
          ...cachedStorage,
          ...innerPendingActionStatus,
        };
      } catch (e) {
        console.warn(e);
        return innerPendingActionStatus;
      }
    };
    if (shouldFetch.current) {
      setPendingActionStatus(mergeFetchStatus());
      await localforage.setItem(cacheKey, mergeFetchStatus());
      // for next interval
    } else {
      shouldFetch.current = true;
    }
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
          openNotification({
            type: 'error',
            description: parseError(e.message),
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
          await localforage.setItem(cacheKey, {
            ...pendingActionStatus,
            [txHash]: {
              status: MessageStatus.RELAYED,
              startTime: +dayjs(),
            },
          });
          setPendingActionStatus({
            ...pendingActionStatus,
            [txHash]: {
              status: MessageStatus.RELAYED,
              startTime: +dayjs(),
            },
          });
          shouldFetch.current = false;
        } catch (e: any) {
          openNotification({
            type: 'error',
            description: parseError(e.message),
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
  }, 30000);

  return (
    <div className={styles.bridgeOutter}>
      <div className={styles.bridge}>
        <Typography variant="h4" weight={600}>
          Bridge
        </Typography>

        <Typography className={styles.typography} type="secondary" variant="medium">
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

            <div className="col-flex" style={{ alignItems: 'center', rowGap: 16 }}>
              <Typography type="secondary" variant="small">
                Transfer time: A few minutes
              </Typography>
              {Date.now() < 1710291600000 ? (
                <Typography type="secondary" variant="medium" style={{ textAlign: 'center' }}>
                  SubQuery is providing a 100% rebate (a refund) of the gas fees that you incur bridging tokens from
                  Ethereum to Base. This means that these bridge actions will cost you nothing.{' '}
                  <Typography.Link
                    type="info"
                    href="https://blog.subquery.network/subquery-network-bridge-gas-rebate-program"
                  >
                    Read the terms and apply
                  </Typography.Link>
                  .
                </Typography>
              ) : null}
            </div>

            <Button
              type="primary"
              size="large"
              shape="round"
              style={{ width: '100%' }}
              onClick={
                chain?.id !== l1Chain.id
                  ? () => {
                      switchChainAsync?.({
                        chainId: l1Chain.id,
                      });
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
                Need help? please message <span>#network-bridge-support on</span>
                <Typography.Link href="https://discord.com/invite/subquery"> Discord</Typography.Link>
              </div>
            </Typography>
          </div>
        )}

        {currentTab === 'baseToEth' && (
          <>
            <div className={styles.bridgeContent}>
              <div className="col-flex" style={{ alignItems: 'center', gap: 8, width: '100%' }}>
                <Steps
                  steps={[
                    {
                      title: 'Start on Base',
                    },
                    {
                      title: 'Ethereum Confirm',
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

              <div className="col-flex" style={{ alignItems: 'center', rowGap: 16 }}>
                <Typography variant="medium" type="secondary" style={{ textAlign: 'center' }}>
                  OP stack and Base requires that any bridging to Ethereum requires a 7 day withdraw period. If you do
                  not want to wait for the required 7 days, please consider a{' '}
                  <Typography.Link href="https://www.base.org/ecosystem?tag=bridge" target="_blank" rel="noreferrer">
                    third party bridge
                  </Typography.Link>
                  .
                </Typography>
                {Date.now() < 1710291600000 ? (
                  <Typography variant="medium" type="secondary" style={{ textAlign: 'center' }}>
                    Once you initiate this bridge action and confirm the withdraw, it cannot be cancelled.
                  </Typography>
                ) : null}
              </div>

              <Button
                type="primary"
                size="large"
                shape="round"
                style={{ width: '100%' }}
                onClick={
                  chain?.id !== l2Chain.id
                    ? () => {
                        switchChainAsync?.({
                          chainId: l2Chain.id,
                        });
                      }
                    : withdrawStart
                }
                loading={startL2BridgeLoading}
                disabled={!val || val === '0'}
              >
                {chain?.id !== l2Chain.id ? 'Switch to Base' : 'Start Bridge'}
              </Button>

              <Typography type="secondary" style={{ display: 'flex', alignItems: 'center', gap: 8 }} variant="medium">
                <BsLifePreserver />
                <div>
                  Need help? please message #network-bridge-support on
                  <Typography.Link href="https://discord.com/invite/subquery"> Discord</Typography.Link>
                </div>
              </Typography>
            </div>

            {sortedWithdrawRecords.length ? (
              <div className="col-flex" style={{ alignItems: 'center', marginTop: 22, gap: 16, width: '100%' }}>
                <Typography variant="h5" weight={600}>
                  Pending Bridge Actions
                </Typography>

                {sortedWithdrawRecords.map((item) => {
                  const status = pendingActionStatus[item.txHash]?.status;

                  const btnMsgFunc = () => {
                    if (status === MessageStatus.RELAYED) {
                      if (pendingActionStatus[item.txHash].startTime) {
                        const durationTime = +dayjs() - (pendingActionStatus[item.txHash].startTime as number);
                        const duration = dayjs.duration(durationTime);
                        const maxPeiod = dayjs.duration(7, 'day');
                        const leftTime = maxPeiod.subtract(duration);

                        if (leftTime.days() === 0 && leftTime.hours() === 0) {
                          return `Finished`;
                        }

                        return `Please wait another ${leftTime.days()} days ${leftTime.hours()} hours (estimate)`;
                      }
                    }

                    return (
                      btnMsgs[status] ||
                      `${Object.keys(pendingActionStatus).length === 0 ? 'Fetching status...' : 'Unknown'}`
                    );
                  };

                  const desc = descMsgs[status] || 'Unknown';
                  const isL1Chain = chain?.id === l1Chain.id;
                  const disable =
                    isL1Chain && status !== MessageStatus.READY_TO_PROVE && status !== MessageStatus.READY_FOR_RELAY;

                  return (
                    <div className={styles.pendingAction} key={item.id}>
                      <Typography>
                        Bridge for <strong>{Number(formatSQT(item.amount)).toLocaleString()} SQT</strong> from Base{' '}
                        {'->'} Ethereum{' '}
                      </Typography>
                      <Typography type="secondary" variant="small">
                        {desc}
                      </Typography>

                      {
                        <Button
                          type="primary"
                          size="large"
                          shape="round"
                          style={{ width: '100%' }}
                          loading={disable ? false : withdrawLoading}
                          disabled={disable}
                          onClick={() => {
                            if (chain?.id !== l1Chain.id) {
                              switchChainAsync?.({
                                chainId: l1Chain.id,
                              });
                              return;
                            }
                            withdrawApproveOrFinalize(item.txHash);
                          }}
                        >
                          {chain?.id !== l1Chain.id ? 'Switch to Ethereum' : btnMsgFunc()}
                        </Button>
                      }
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
  );
};

const Bridge: FC = () => {
  return <WalletRoute element={<BridgeInner />}></WalletRoute>;
};
export default Bridge;
