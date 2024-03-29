// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React, { FC, useMemo, useState } from 'react';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import IPFSImage from '@components/IPFSImage';
import { ApproveContract } from '@components/ModalApproveToken';
import { NumberInput } from '@components/NumberInput';
import { useSQToken } from '@containers';
import { parseEther } from '@ethersproject/units';
import { useDeploymentMetadata, useProjectFromQuery } from '@hooks';
import { useAddAllowance } from '@hooks/useAddAllowance';
import { Modal, openNotification, Steps, Tag, Typography } from '@subql/components';
import { formatSQT, useGetDeploymentBoosterTotalAmountByDeploymentIdQuery } from '@subql/react-hooks';
import { cidToBytes32, parseError, TOKEN } from '@utils';
import { formatNumber } from '@utils/numberFormatters';
import { retry } from '@utils/retry';
import { Button, Form, Radio, Tooltip } from 'antd';
import { useForm, useWatch } from 'antd/es/form/Form';
import BigNumberJs from 'bignumber.js';
import clsx from 'clsx';
import { useAccount } from 'wagmi';

import { useWeb3Store } from 'src/stores';

import styles from './index.module.less';

interface IProps {
  projectId?: string;
  deploymentId?: string;
  actionBtn?: React.ReactNode;
  onSuccess?: () => void;
  initAddOrRemove?: 'add' | 'remove';
}

const DoBooster: FC<IProps> = ({ projectId, deploymentId, actionBtn, initAddOrRemove = 'add', onSuccess }) => {
  const { address: account } = useAccount();
  const [form] = useForm();
  const formBoostVal = useWatch('boostVal', form);

  const { balance } = useSQToken();

  const { contracts } = useWeb3Store();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addOrRemove, setAddOrRemove] = useState<'add' | 'remove'>(initAddOrRemove);
  const { checkAllowanceEnough, addAllowance } = useAddAllowance();
  // better to lazy all of these fetch
  const project = useProjectFromQuery(projectId ?? '');
  const { data: deploymentMetadata } = useDeploymentMetadata(deploymentId);

  const deploymentBooster = useGetDeploymentBoosterTotalAmountByDeploymentIdQuery({
    variables: {
      deploymentId: deploymentId || '',
      consumer: account || '',
    },
    fetchPolicy: 'network-only',
  });

  const existingBoost = useMemo(() => {
    return BigNumberJs(
      deploymentBooster.data?.deploymentBoosterSummaries?.aggregates?.sum?.totalAmount.toString() || '0',
    ).toString();
  }, [deploymentBooster.data]);

  const existingBoostByConsumer = useMemo(() => {
    return BigNumberJs(
      deploymentBooster.data?.deploymentBoosterSummariesByConsumer?.aggregates?.sum?.totalAmount.toString() || '0',
    ).toString();
  }, [deploymentBooster.data]);

  const updateBoost = async () => {
    try {
      if (!deploymentId) return;
      setLoading(true);
      const deploymentToByte32 = cidToBytes32(deploymentId);
      const { boostVal } = form.getFieldsValue();
      const submitVal = parseEther(BigNumberJs(boostVal).toString() || '0').toString();

      if (addOrRemove === 'add') {
        const isEnough = await checkAllowanceEnough(ApproveContract.RewardsBooster, account || '', submitVal);
        if (!isEnough) {
          await addAllowance(ApproveContract.RewardsBooster, submitVal);
        }
        const tx = await contracts?.rewardsBooster.boostDeployment(deploymentToByte32, submitVal);
        await tx?.wait();
      } else {
        const tx = await contracts?.rewardsBooster.removeBoosterDeployment(deploymentToByte32, submitVal);
        await tx?.wait();
      }
      await balance.refetch();
      retry(() => {
        deploymentBooster.refetch();
      });
      openNotification({
        type: 'success',
        title: 'Boost completed successfully',
        description: `Boost amount: ${formatSQT(
          BigNumberJs(existingBoostByConsumer)
            .plus(addOrRemove === 'add' ? BigNumberJs(submitVal) : BigNumberJs(submitVal).negated())
            .toString(),
        )} SQT`,
        duration: 5,
      });
      onSuccess?.();
      setOpen(false);
    } catch (e) {
      parseError(e, {
        alert: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.doBooster}>
      {actionBtn ? (
        <div
          onClick={async () => {
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
          loading={loading}
          onClick={async () => {
            setOpen(true);
          }}
          disabled={!account}
        >
          Boost
        </Button>
      )}

      <Modal
        open={open}
        title="Boost"
        cancelButtonProps={{
          style: {
            display: 'none',
          },
        }}
        okText={addOrRemove === 'add' ? 'Add Boost' : 'Remove Boost'}
        width={572}
        onCancel={() => setOpen(false)}
        onSubmit={updateBoost}
        okButtonProps={{
          disabled: !formBoostVal,
          shape: 'round',
          type: 'primary',
          size: 'large',
        }}
      >
        <Steps
          steps={[
            {
              title: addOrRemove === 'add' ? 'Add Boost' : 'Remove Boost',
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
            <div className={clsx('flex')} style={{ gap: 4, marginBottom: 8, height: 24 }}>
              <Typography className="overflowEllipsis" style={{ maxWidth: 320 }}>
                {project.data?.metadata.name}
              </Typography>
              <Tag className="overflowEllipsis" style={{ maxWidth: 100 }}>
                {deploymentMetadata?.version}
              </Tag>
            </div>
            <Typography>
              Existing Boost: {formatNumber(formatSQT(existingBoost))} {TOKEN}
            </Typography>
          </div>
        </div>

        <Radio.Group
          value={addOrRemove}
          onChange={(val) => {
            setAddOrRemove(val.target.value);
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: 16, margin: '24px 0 0 0' }}
        >
          <Radio value="add">Add Booster</Radio>
          <Radio value="remove" disabled={existingBoostByConsumer === '0'}>
            Remove Booster
          </Radio>
        </Radio.Group>

        <div style={{ height: 1, width: '100%', background: 'var(--sq-gray400)', margin: '24px 0' }}></div>

        <div>
          <Form layout="vertical" form={form}>
            <Typography>Boost amount</Typography>
            <Form.Item
              style={{ marginBottom: 0 }}
              name="boostVal"
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
                maxAmount={
                  addOrRemove === 'add'
                    ? formatSQT(balance.result.data?.toString() || '0')
                    : formatSQT(existingBoostByConsumer || '0')
                }
                inputParams={{
                  max:
                    addOrRemove === 'add'
                      ? formatSQT(balance.result.data?.toString() || '0')
                      : formatSQT(existingBoostByConsumer || '0'),
                  value: form.getFieldValue('boostVal'),
                  onChange: (value) => {
                    form.setFieldsValue({ boostVal: value });
                  },
                }}
                onClickMax={(value) => {
                  form.setFieldsValue({ boostVal: value });
                }}
              ></NumberInput>
            </Form.Item>
          </Form>
          <div className="col-flex" style={{ gap: 8, marginBottom: 24 }}>
            <div className="flex">
              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <Typography
                  variant="medium"
                  type="secondary"
                  className="overflowEllipsis2"
                  style={{ display: 'flex', gap: 5, width: '100%' }}
                >
                  Current boosted amount to
                  <div className="overflowEllipsis" style={{ maxWidth: 200 }}>
                    {project.data?.metadata.name}
                  </div>
                </Typography>
                <Tooltip title="The total amount that you have already boosted this project.">
                  <AiOutlineInfoCircle
                    style={{ fontSize: 14, marginLeft: 6, color: 'var(--sq-gray500)' }}
                  ></AiOutlineInfoCircle>
                </Tooltip>
              </div>
              <Typography variant="medium">
                {formatNumber(formatSQT(existingBoostByConsumer || '0'))} {TOKEN}
              </Typography>
            </div>

            <div className="flex">
              <Typography variant="medium" type="secondary" style={{ display: 'flex', alignItems: 'center' }}>
                Available amount to boost {TOKEN}
                <Tooltip title="The total amount that you can freely boost to new projects.">
                  <AiOutlineInfoCircle
                    style={{ fontSize: 14, marginLeft: 6, color: 'var(--sq-gray500)' }}
                  ></AiOutlineInfoCircle>
                </Tooltip>
              </Typography>
              <span style={{ flex: 1 }}></span>
              <Typography variant="medium">
                {formatSQT(balance.result.data?.toString() || '0')} {TOKEN}
              </Typography>
            </div>
          </div>
          {/* <Typography variant="medium">
            Estimated allocation rewards after update: {estimatedRewardsAfterInput} {TOKEN} Per era
          </Typography> */}
        </div>
      </Modal>
    </div>
  );
};
export default DoBooster;
