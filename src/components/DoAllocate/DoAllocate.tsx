// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useEffect, useMemo, useState } from 'react';
import IPFSImage from '@components/IPFSImage';
import { NumberInput } from '@components/NumberInput';
import { NETWORK_NAME } from '@containers/Web3';
import { parseEther } from '@ethersproject/units';
import { useDeploymentMetadata, useProjectFromQuery, useSortedIndexer } from '@hooks';
import { useEthersProviderWithPublic } from '@hooks/useEthersProvider';
import { Modal, openNotification, Steps, Tag, Typography } from '@subql/components';
import { cidToBytes32 } from '@subql/network-clients';
import { SQNetworks } from '@subql/network-config';
import { useGetIndexerAllocationSummaryLazyQuery } from '@subql/react-hooks';
import { parseError, TOKEN } from '@utils';
import { retry } from '@utils/retry';
import { Button, Form } from 'antd';
import { useForm, useWatch } from 'antd/es/form/Form';
import BigNumber from 'bignumber.js';
import { useAccount } from 'wagmi';

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
  const sortedIndexer = useSortedIndexer(account || '');
  const [getAllocatedStake, allocatedStake] = useGetIndexerAllocationSummaryLazyQuery();
  const provider = useEthersProviderWithPublic();

  const [form] = useForm();
  const formAllocateVal = useWatch('allocateVal', form);
  const { contracts } = useWeb3Store();
  const [open, setOpen] = useState(false);
  const [currentRewardsPerToken, setCurrentRewardsPerToken] = useState(BigNumber(0));

  const currentBooster = React.useMemo(() => {
    if (!project.data) return '0';
    return (
      project.data.deployments.nodes.find((i) => i?.id === deploymentId)?.deploymentBoosterSummariesByDeploymentId
        ?.groupedAggregates?.[0]?.sum?.totalAmount || '0'
    );
  }, [project, deploymentId]);

  const avaibleStakeAmount = useMemo(() => {
    const totalStake = BigNumber(sortedIndexer.data?.totalStake.current || '0');
    const haveAllocated = formatSQT(
      BigNumber(allocatedStake.data?.indexerAllocationSummary?.totalAmount.toString() || '0').toString(),
    );

    return totalStake.minus(haveAllocated).toString();
  }, [allocatedStake, sortedIndexer]);

  const estimatedRewardsPerTokenOneEra = useMemo(() => {
    // 2s one block
    // 7 days one era
    return currentRewardsPerToken.multipliedBy(NETWORK_NAME === SQNetworks.TESTNET ? 1800 : 1800 * 24 * 7);
  }, [currentRewardsPerToken]);

  const getCurrentRewardsPerToken = async () => {
    if (!deploymentId) return;
    const blockNumber = await provider?.getBlockNumber();

    const current = await contracts?.rewardsBooster.getAccRewardsPerAllocatedToken(cidToBytes32(deploymentId), {
      blockTag: blockNumber,
    });

    const previous = await contracts?.rewardsBooster.getAccRewardsPerAllocatedToken(cidToBytes32(deploymentId), {
      blockTag: blockNumber - 1,
    });

    console.warn(current?.toString(), previous?.toString());

    setCurrentRewardsPerToken(BigNumber(current?.[0].toString() || '0').minus(previous?.[0].toString() || '0'));
  };

  const updateAllocate = async () => {
    if (!deploymentId || !account) return;

    await form.validateFields();

    const addOrRemoveFunc = BigNumber(form.getFieldValue('allocateVal')).gt(
      formatSQT(allocatedStake.data?.indexerAllocationSummary?.totalAmount.toString() || '0'),
    )
      ? contracts?.stakingAllocation.addAllocation
      : contracts?.stakingAllocation.removeAllocation;

    try {
      const res = await addOrRemoveFunc?.(
        cidToBytes32(deploymentId),
        account,
        parseEther(
          BigNumber(form.getFieldValue('allocateVal'))
            .minus(formatSQT(allocatedStake.data?.indexerAllocationSummary?.totalAmount.toString() || '0'))
            .abs()
            .toString(),
        ),
      );

      await res?.wait();
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
      getCurrentRewardsPerToken();
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

        <div style={{ height: 1, width: '100%', background: 'var(--sq-gray400)', margin: '24px 0' }}></div>

        <div className="col-flex" style={{ gap: 8 }}>
          <div className="flex">
            <Typography variant="medium" type="secondary">
              Current allocated stake to {project.data?.metadata.name}
            </Typography>
            <span style={{ flex: 1 }}></span>
            <Typography variant="medium">
              {formatNumber(formatSQT(allocatedStake.data?.indexerAllocationSummary?.totalAmount || '0'))} {TOKEN}
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

        <div>
          <Form layout="vertical" form={form}>
            <Typography style={{ marginTop: 24 }}>New allocation amount</Typography>
            <Form.Item
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
                maxAmount={avaibleStakeAmount}
                inputParams={{
                  max: avaibleStakeAmount,
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

          <Typography variant="medium">
            Estimated allocation rewards after update:{' '}
            {estimatedRewardsPerTokenOneEra.eq(0)
              ? 'Unknown'
              : formatNumber(
                  formatSQT(estimatedRewardsPerTokenOneEra.multipliedBy(formAllocateVal || 0).toString()),
                )}{' '}
            {TOKEN} Per era
          </Typography>
        </div>
      </Modal>
    </div>
  );
};
export default DoAllocate;
