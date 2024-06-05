// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect, useMemo, useState } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import IPFSImage from '@components/IPFSImage';
import { useMakeNotification } from '@components/NotificationCentre/useMakeNotification';
import { NumberInput } from '@components/NumberInput';
import { NETWORK_NAME, useAccount } from '@containers/Web3';
import { parseEther } from '@ethersproject/units';
import { useDeploymentMetadata, useProjectFromQuery } from '@hooks';
import { useAsyncMemoWithLazy } from '@hooks/useAsyncMemo';
import { useEthersProviderWithPublic } from '@hooks/useEthersProvider';
import { useWaitTransactionhandled } from '@hooks/useWaitTransactionHandled';
import { Modal, openNotification, Steps, Tag, Typography } from '@subql/components';
import { cidToBytes32 } from '@subql/network-clients';
import { SQNetworks } from '@subql/network-config';
import { ProjectType } from '@subql/network-query';
import { useGetIndexerAllocationSummaryLazyQuery } from '@subql/react-hooks';
import { parseError, TOKEN } from '@utils';
import { Button, Form, Radio, Tooltip } from 'antd';
import { useForm, useWatch } from 'antd/es/form/Form';
import BigNumber from 'bignumber.js';

import { PER_MILL } from 'src/const/const';
import { useWeb3Store } from 'src/stores';

import { formatSQT } from '../../utils/numberFormatters';
import { formatNumber } from '../../utils/numberFormatters';
import styles from './index.module.less';

interface IProps {
  projectId?: string;
  deploymentId?: string;
  actionBtn?: React.ReactNode;
  onSuccess?: () => void;
  initialStatus?: 'Add' | 'Remove';
  disabled?: boolean;
}

const DoAllocate: FC<IProps> = ({ projectId, deploymentId, actionBtn, onSuccess, initialStatus, disabled }) => {
  const { address: account } = useAccount();
  const project = useProjectFromQuery(projectId ?? '');
  const { data: deploymentMetadata } = useDeploymentMetadata(deploymentId);
  const [getAllocatedStake, allocatedStake] = useGetIndexerAllocationSummaryLazyQuery();
  const provider = useEthersProviderWithPublic();

  const [form] = useForm();
  const formAllocateVal = useWatch('allocateVal', form);
  const { contracts } = useWeb3Store();
  const [open, setOpen] = useState(false);
  const [estimatedRewardsOneEra, setEstimatedRewardsOneEra] = useState(BigNumber(0));
  const [addOrRemove, setAddOrRemove] = useState<'Add' | 'Remove'>(initialStatus || 'Add');
  const waitTransactionHandled = useWaitTransactionhandled();
  const { refreshAndMakeOverAllocateNotification, refreshAndMakeOutdateAllocationProjects } = useMakeNotification();

  const [fetchTotalDeploymentAllocation, totalDeploymentAllocation] = useLazyQuery(gql`
    query GetDeploymentAllocationSummary($deploymentId: String!) {
      indexerAllocationSummaries(filter: { deploymentId: { equalTo: $deploymentId } }) {
        aggregates {
          sum {
            totalAmount
          }
        }
      }
    }
  `);

  const totalAllocations = useMemo(() => {
    if (totalDeploymentAllocation?.data?.indexerAllocationSummaries) {
      return formatSQT(totalDeploymentAllocation.data.indexerAllocationSummaries?.aggregates?.sum?.totalAmount);
    }

    return '0';
  }, [totalDeploymentAllocation.data]);

  const runnerAllocation = useAsyncMemoWithLazy(async () => {
    if (!account || !open)
      return {
        total: '0',
        used: '0',
        left: '0',
      };
    const res = await contracts?.stakingAllocation.runnerAllocation(account);

    return {
      total: formatSQT(res?.total.toString() || '0'),
      used: formatSQT(res?.used.toString() || '0'),
      left: formatSQT(res?.total.sub(res.used).toString() || '0', { fixedNum: 18, toStringOrNumber: 'string' }),
    };
  }, [account, open]);

  const allocationRewardsRate = useAsyncMemoWithLazy(async () => {
    if (!open) return '0';
    const rewards = await contracts?.rewardsBooster.boosterQueryRewardRate(
      project.data?.type === ProjectType.RPC ? 1 : 0,
    );
    return BigNumber(1)
      .minus(BigNumber(rewards?.toString() || '0').div(PER_MILL))
      .toFixed();
  }, [open]);

  const getAllocateRewardsPerBlock = async () => {
    if (!allocationRewardsRate.result.data || allocationRewardsRate.result.data === '0' || !deploymentId) return;

    const blockNumber = await provider?.getBlockNumber();

    const currentRewards = await contracts?.rewardsBooster.getAccRewardsForDeployment(cidToBytes32(deploymentId), {
      blockTag: blockNumber,
    });
    const prevRewards = await contracts?.rewardsBooster.getAccRewardsForDeployment(cidToBytes32(deploymentId), {
      blockTag: blockNumber - 1,
    });

    const currentWithRate = BigNumber(currentRewards?.toString() || '0')?.multipliedBy(
      allocationRewardsRate.result.data || '0',
    );
    const prevWithRate = BigNumber(prevRewards?.toString() || '0')?.multipliedBy(allocationRewardsRate.result.data);

    setEstimatedRewardsOneEra(
      currentWithRate
        ?.minus(prevWithRate || '0')
        .multipliedBy(NETWORK_NAME === SQNetworks.TESTNET ? 1800 : 1800 * 24 * 7),
    );
  };

  const currentBooster = React.useMemo(() => {
    if (!project.data) return '0';
    return (
      project.data.deployments.nodes.find((i) => i?.id === deploymentId)?.deploymentBoosterSummariesByDeploymentId
        ?.groupedAggregates?.[0]?.sum?.totalAmount || '0'
    );
  }, [project, deploymentId]);

  const avaibleStakeAmount = useMemo(() => {
    const leftAllocation = runnerAllocation.result.data?.left
      ? BigNumber(runnerAllocation.result.data?.left)
      : BigNumber(0);

    return leftAllocation.toFixed(18);
  }, [allocatedStake, runnerAllocation.result.data?.left]);

  const currentAllocatedTokensOfThisDeployment = useMemo(() => {
    return formatSQT(allocatedStake.data?.indexerAllocationSummary?.totalAmount || '0', {
      fixedNum: 18,
      toStringOrNumber: 'string',
    });
  }, [allocatedStake.data]);

  const estimatedRewardsAfterInput = useMemo(() => {
    if (estimatedRewardsOneEra.eq(0) || !formAllocateVal) {
      return 'Unknown';
    }

    const newAllcation =
      addOrRemove === 'Add'
        ? BigNumber(formAllocateVal).plus(
            formatSQT(allocatedStake.data?.indexerAllocationSummary?.totalAmount.toString() || '0'),
          )
        : BigNumber(formatSQT(allocatedStake.data?.indexerAllocationSummary?.totalAmount.toString() || '0')).minus(
            formAllocateVal,
          );

    const percentageOfNewAllocation = newAllcation.div(
      BigNumber(totalAllocations).minus(currentAllocatedTokensOfThisDeployment).plus(newAllcation),
    );

    return formatSQT(
      estimatedRewardsOneEra
        .multipliedBy(percentageOfNewAllocation.isFinite() ? percentageOfNewAllocation : 1)
        .toString(),
    );
  }, [estimatedRewardsOneEra, formAllocateVal, addOrRemove, totalAllocations, currentAllocatedTokensOfThisDeployment]);

  const estimatedApyAfterInput = useMemo(() => {
    if (estimatedRewardsAfterInput === 'Unknown') return 'Unknown';
    return formatNumber(BigNumber(estimatedRewardsAfterInput).div(7).multipliedBy(365).toString());
  }, [estimatedRewardsAfterInput]);

  const updateAllocate = async () => {
    if (!deploymentId || !account) return;

    await form.validateFields();

    const addOrRemoveFunc =
      addOrRemove === 'Add'
        ? contracts?.stakingAllocation.addAllocation
        : contracts?.stakingAllocation.removeAllocation;

    try {
      const res = await addOrRemoveFunc?.(
        cidToBytes32(deploymentId),
        account,
        parseEther(BigNumber(form.getFieldValue('allocateVal')).toFixed(18, 1)),
      );

      const receipt = await res?.wait();
      // runnerAllocation fetch from contract, so if the transaction confirmed, then the data should be updated
      await Promise.all([waitTransactionHandled(receipt?.blockNumber), runnerAllocation.refetch()]);
      await onSuccess?.();
      refreshAndMakeOverAllocateNotification();
      refreshAndMakeOutdateAllocationProjects();
      form.resetFields();
      openNotification({
        type: 'success',
        description: 'Update allocation successfully',
      });
      setOpen(false);
    } catch (e) {
      openNotification({
        type: 'error',
        description: parseError(e),
      });
    }
  };

  const init = async () => {
    if (open && account && deploymentId && !disabled) {
      setAddOrRemove(initialStatus || 'Add');
      fetchTotalDeploymentAllocation({
        variables: {
          deploymentId,
        },
      });
      getAllocatedStake({
        variables: {
          id: `${deploymentId}:${account}`,
        },
        fetchPolicy: 'network-only',
      });
      runnerAllocation.refetch();
    }
  };

  useEffect(() => {
    init();
  }, [open, account, deploymentId, disabled]);

  useEffect(() => {
    if (open) {
      getAllocateRewardsPerBlock();
    }
  }, [open, allocationRewardsRate.result.data]);

  return (
    <div className={styles.doAllocate}>
      {actionBtn ? (
        <div
          onClick={async () => {
            if (!disabled) {
              await allocationRewardsRate.refetch();
              setOpen(true);
            }
          }}
        >
          {actionBtn}
        </div>
      ) : (
        <Button
          type="primary"
          shape="round"
          size="large"
          onClick={async () => {
            await allocationRewardsRate.refetch();

            setOpen(true);
          }}
        >
          Allocation
        </Button>
      )}
      <Modal
        open={open}
        onCancel={() => {
          setOpen(false);
        }}
        title={`Update Allocate to ${project.data?.metadata.name}`}
        cancelButtonProps={{ style: { display: 'none' } }}
        onSubmit={updateAllocate}
        okText="Update"
      >
        <Steps
          steps={[
            {
              title: 'Allocate Stake',
            },
            {
              title: 'Confirm transaction',
            },
          ]}
        ></Steps>

        <div className="flex" style={{ marginTop: 24 }}>
          <IPFSImage
            src={project.data?.metadata.image || '/static/default.project.png'}
            style={{ width: 60, height: 60, borderRadius: 8 }}
          ></IPFSImage>

          <div className="col-flex" style={{ marginLeft: 8 }}>
            <div className="flex" style={{ gap: 4, marginBottom: 8, height: 24 }}>
              <Typography className="overflowEllipsis" style={{ maxWidth: 320 }}>
                {project.data?.metadata.name}
              </Typography>
              <Tag className="overflowEllipsis" style={{ maxWidth: 100 }}>
                {deploymentMetadata?.version}
              </Tag>
            </div>
            <Typography>
              Existing Boost: {formatNumber(formatSQT(currentBooster))} {TOKEN}
            </Typography>
          </div>
        </div>

        <div>
          <Radio.Group
            value={addOrRemove}
            onChange={(val) => {
              setAddOrRemove(val.target.value);
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: 16, margin: '24px 0 0 0' }}
          >
            <Radio value="Add">Add Allocation</Radio>
            <Radio
              value="Remove"
              disabled={(allocatedStake.data?.indexerAllocationSummary?.totalAmount.toString() || '0') === '0'}
            >
              Remove Allocation
            </Radio>
          </Radio.Group>
        </div>

        <div style={{ height: 1, width: '100%', background: 'var(--sq-gray400)', margin: '24px 0' }}></div>

        <div>
          <Form layout="vertical" form={form}>
            <Typography>New allocation amount</Typography>
            <Form.Item
              style={{ marginBottom: 0 }}
              name="allocateVal"
              rules={[
                {
                  validator(rule, value) {
                    if (!value && value !== 0) {
                      return Promise.reject(new Error('Please input the amount'));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <NumberInput
                description=""
                maxAmount={addOrRemove === 'Add' ? avaibleStakeAmount : currentAllocatedTokensOfThisDeployment}
                inputParams={{
                  max: addOrRemove === 'Add' ? avaibleStakeAmount : currentAllocatedTokensOfThisDeployment,
                  value: form.getFieldValue('allocateVal'),
                  onChange: (value) => {
                    form.setFieldsValue({ allocateVal: value });
                  },
                }}
                onClickMax={(value) => {
                  form.setFieldsValue({ allocateVal: value });
                }}
              ></NumberInput>
            </Form.Item>
          </Form>
          <div className="col-flex" style={{ gap: 8, marginBottom: 24 }}>
            <div className="flex">
              <Typography variant="medium" type="secondary" style={{ display: 'flex', gap: 5, width: '100%' }}>
                Current allocated stake to
                <div className="overflowEllipsis" style={{ maxWidth: 200 }}>
                  {project.data?.metadata.name}
                </div>
              </Typography>
              <span style={{ flex: 1 }}></span>
              <Tooltip title={currentAllocatedTokensOfThisDeployment}>
                <Typography variant="medium">
                  {formatNumber(currentAllocatedTokensOfThisDeployment)} {TOKEN}
                </Typography>
              </Tooltip>
            </div>

            <div className="flex">
              <div style={{ flexShrink: 0 }}>
                <Typography variant="medium" type="secondary">
                  Available stake to allocate {TOKEN}
                </Typography>
              </div>
              <span style={{ flex: 1 }}></span>
              <Typography variant="medium" style={{ overflowWrap: 'anywhere' }}>
                {avaibleStakeAmount} {TOKEN}
              </Typography>
            </div>
            <div className="flex">
              <Typography variant="medium" type="secondary">
                Estimated New APY
              </Typography>
              <span style={{ flex: 1 }}></span>
              <Typography variant="medium">
                {estimatedApyAfterInput.toString()} {TOKEN}
              </Typography>
            </div>
          </div>
          <Typography variant="medium">
            Estimated allocation rewards after update: {formatNumber(estimatedRewardsAfterInput)} {TOKEN} Per era
          </Typography>
        </div>
      </Modal>
    </div>
  );
};
export default DoAllocate;
