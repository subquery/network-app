// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect, useMemo, useState } from 'react';
import IPFSImage from '@components/IPFSImage';
import { NumberInput } from '@components/NumberInput';
import { NETWORK_NAME } from '@containers/Web3';
import { parseEther } from '@ethersproject/units';
import { useDeploymentMetadata, useProjectFromQuery } from '@hooks';
import { useEthersProviderWithPublic } from '@hooks/useEthersProvider';
import { Modal, openNotification, Steps, Tag, Typography } from '@subql/components';
import { cidToBytes32 } from '@subql/network-clients';
import { SQNetworks } from '@subql/network-config';
import { ProjectType } from '@subql/network-query';
import { useAsyncMemo, useGetIndexerAllocationSummaryLazyQuery } from '@subql/react-hooks';
import { parseError, TOKEN } from '@utils';
import { Button, Form, Radio } from 'antd';
import { useForm, useWatch } from 'antd/es/form/Form';
import BigNumber from 'bignumber.js';
import { useAccount } from 'wagmi';

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
}

const DoAllocate: FC<IProps> = ({ projectId, deploymentId, actionBtn, onSuccess }) => {
  const { address: account } = useAccount();
  const project = useProjectFromQuery(projectId ?? '');
  const { data: deploymentMetadata } = useDeploymentMetadata(deploymentId);
  const [getAllocatedStake, allocatedStake] = useGetIndexerAllocationSummaryLazyQuery();
  const provider = useEthersProviderWithPublic();

  const [form] = useForm();
  const formAllocateVal = useWatch('allocateVal', form);
  const { contracts } = useWeb3Store();
  const [open, setOpen] = useState(false);
  const [currentRewardsPerToken, setCurrentRewardsPerToken] = useState(BigNumber(0));
  const [addOrRemove, setAddOrRemove] = useState<'Add' | 'Remove'>('Add');

  const runnerAllocation = useAsyncMemo(async () => {
    if (!account)
      return {
        total: '0',
        used: '0',
        left: '0',
      };
    const res = await contracts?.stakingAllocation.runnerAllocation(account);

    return {
      total: formatSQT(res?.total.toString() || '0'),
      used: formatSQT(res?.used.toString() || '0'),
      left: formatSQT(res?.total.sub(res.used).toString() || '0'),
    };
  }, [account]);

  const allocationRewardsRate = useAsyncMemo(async () => {
    const rewards = await contracts?.rewardsBooster.boosterQueryRewardRate(
      project.data?.type === ProjectType.RPC ? 1 : 0,
    );
    return BigNumber(1)
      .minus(BigNumber(rewards?.toString() || '0').div(PER_MILL))
      .toFixed();
  }, []);

  const getAllocateRewardsPerBlock = async () => {
    if (!allocationRewardsRate.data || !deploymentId) return;
    const blockNumber = await provider?.getBlockNumber();

    const currentRewards = await contracts?.rewardsBooster.getAccRewardsForDeployment(cidToBytes32(deploymentId), {
      blockTag: blockNumber,
    });
    const prevRewards = await contracts?.rewardsBooster.getAccRewardsForDeployment(cidToBytes32(deploymentId), {
      blockTag: blockNumber - 1,
    });

    const blocks = NETWORK_NAME === SQNetworks.TESTNET ? 1800 : 1800 * 24 * 7;

    const currentWithRate = BigNumber(currentRewards?.toString() || '0')?.multipliedBy(
      allocationRewardsRate.data || '0',
    );
    const prevWithRate = BigNumber(prevRewards?.toString() || '0')?.multipliedBy(allocationRewardsRate.data);

    setCurrentRewardsPerToken(currentWithRate?.minus(prevWithRate || '0').div(blocks));
  };

  const currentBooster = React.useMemo(() => {
    if (!project.data) return '0';
    return (
      project.data.deployments.nodes.find((i) => i?.id === deploymentId)?.deploymentBoosterSummariesByDeploymentId
        ?.groupedAggregates?.[0]?.sum?.totalAmount || '0'
    );
  }, [project, deploymentId]);

  const avaibleStakeAmount = useMemo(() => {
    const leftAllocation = runnerAllocation.data?.left ? BigNumber(runnerAllocation.data?.left) : BigNumber(0);
    return leftAllocation.toString();
  }, [allocatedStake, runnerAllocation.data?.left]);

  const currentAllocatedTokensOfThisDeployment = useMemo(() => {
    return formatSQT(allocatedStake.data?.indexerAllocationSummary?.totalAmount || '0');
  }, [allocatedStake.data]);

  const estimatedRewardsPerTokenOneEra = useMemo(() => {
    // 2s one block
    // 7 days one era
    return currentRewardsPerToken.multipliedBy(NETWORK_NAME === SQNetworks.TESTNET ? 1800 : 1800 * 24 * 7);
  }, [currentRewardsPerToken]);

  const estimatedRewardsAfterInput = useMemo(() => {
    // lack div all tokens
    // to know all tokens that already allocated is not very easy.
    if (estimatedRewardsPerTokenOneEra.eq(0) || !formAllocateVal) {
      return 'Unkonwn';
    }

    return formatNumber(
      formatSQT(
        estimatedRewardsPerTokenOneEra
          .multipliedBy(
            BigNumber(formAllocateVal)
              .minus(formatSQT(allocatedStake.data?.indexerAllocationSummary?.totalAmount.toString() || '0'))
              .abs() || 0,
          )
          .toString(),
      ),
    );
  }, [estimatedRewardsPerTokenOneEra, formAllocateVal, addOrRemove]);

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
        parseEther(BigNumber(form.getFieldValue('allocateVal')).toFixed()),
      );

      await res?.wait();
      await runnerAllocation.refetch();
      onSuccess?.();
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

  useEffect(() => {
    if (open && account && deploymentId) {
      getAllocatedStake({
        variables: {
          id: `${deploymentId}:${account}`,
        },
        fetchPolicy: 'network-only',
      });
      getAllocateRewardsPerBlock();
      runnerAllocation.refetch();
    }
  }, [open, account, deploymentId]);

  return (
    <div className={styles.doAllocate}>
      {actionBtn ? (
        <div
          onClick={() => {
            setOpen(true);
          }}
        >
          {actionBtn}
        </div>
      ) : (
        <Button
          type="primary"
          shape="round"
          size="large"
          onClick={() => {
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
            <div className="flex" style={{ gap: 4, marginBottom: 8 }}>
              <Typography>{project.data?.metadata.name}</Typography>
              <Tag>{deploymentMetadata?.version}</Tag>
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
              <Typography variant="medium" type="secondary">
                Current allocated stake to {project.data?.metadata.name}
              </Typography>
              <span style={{ flex: 1 }}></span>
              <Typography variant="medium">
                {formatNumber(currentAllocatedTokensOfThisDeployment)} {TOKEN}
              </Typography>
            </div>

            <div className="flex">
              <Typography variant="medium" type="secondary">
                Available stake to allocate {TOKEN}
              </Typography>
              <span style={{ flex: 1 }}></span>
              <Typography variant="medium">
                {avaibleStakeAmount} {TOKEN}
              </Typography>
            </div>
          </div>
          <Typography variant="medium">
            Estimated allocation rewards after update: {estimatedRewardsAfterInput} {TOKEN} Per era
          </Typography>
        </div>
      </Modal>
    </div>
  );
};
export default DoAllocate;
