// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import assert from 'assert';
import { parseEther } from '@ethersproject/units';
import { BigNumber, utils } from 'ethers';
import { Button, Modal, Spinner, Typography } from '@subql/react-ui';
import { Form, Formik } from 'formik';
import * as yup from 'yup';
import { useAsyncMemo, useEraValue } from '../../../hooks';
import { currentEraValueToString, EraValue } from '../../../hooks/useEraValue';
import { useContracts, useWeb3 } from '../../../containers';
import React from 'react';
import { newModalStyles, renderAsync } from '../../../utils';
import { FTextInput } from '../../../components';
import ReactModal from 'react-modal';

const DelegationSchema = yup.object({ amount: yup.number().required() });
type DelegationFormProps = yup.Asserts<typeof DelegationSchema>;

const ChangeDelegationModal: React.FC<{ indexerAddress: string; onClose: () => void; type: 'add' | 'remove' }> = ({
  indexerAddress,
  onClose,
  type,
}) => {
  const pendingContracts = useContracts();
  const { account } = useWeb3();

  const action = account === indexerAddress ? 'Stake' : 'Delegation';

  const hasAllowance = useAsyncMemo(async () => {
    const contracts = await pendingContracts;

    assert(contracts, 'Contracts not available');
    assert(account, 'Account not available');

    return contracts.sqToken.allowance(account, contracts.staking.address);
  }, [pendingContracts, account]);

  const addDelegation = async (props: DelegationFormProps) => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');
    console.log('props', props);
    console.log('contracts', contracts);
    // TODO check allowance

    const ether = parseEther(props.amount.toString());
    console.log('ether', ether);
    const tx = await (account === indexerAddress
      ? type === 'add'
        ? contracts.indexerRegistry.stake(ether)
        : contracts.indexerRegistry.unstake(ether)
      : type === 'add'
      ? contracts.staking.delegate(indexerAddress, ether)
      : contracts.staking.undelegate(indexerAddress, ether));
    console.log('tx', tx);
    const test = await tx.wait();
    console.log('test', test);
    onClose();
  };

  const increaseAllowance = async () => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    const tx = await contracts.sqToken.increaseAllowance(contracts.staking.address, utils.parseEther('1000'));

    await tx.wait();

    hasAllowance.refetch();
  };

  const title = `${type} ${action} SQT to this Indexer`;
  const submitText = `${type} ${action}`;

  const renderDefault = () => {
    return (
      <Formik initialValues={{ amount: 0 }} validationSchema={DelegationSchema.shape({})} onSubmit={addDelegation}>
        {({ submitForm }) => (
          <Modal title={title} submitText={submitText} onSubmit={submitForm}>
            <Form>
              <FTextInput label="Amount" id="amount" />
            </Form>
          </Modal>
        )}
      </Formik>
    );
  };

  if (type === 'add') {
    return renderAsync(hasAllowance, {
      loading: () => (
        <Modal title={title} submitText={submitText} onSubmit={() => null} cancelText="Cancel">
          <Spinner />
        </Modal>
      ),
      error: () => null,
      data: (allowance) => {
        if (allowance?.isZero()) {
          return (
            <Modal
              title="Approve SQT for staking"
              submitText="Approve"
              onSubmit={increaseAllowance}
              cancelText="Cancel"
            />
          );
        } else {
          return renderDefault();
        }
      },
    });
  }

  return renderDefault();
};

const OwnDelegation: React.VFC<{ indexerAddress: string }> = ({ indexerAddress }) => {
  const { account } = useWeb3();
  const pendingContracts = useContracts();

  const [showDelegationModal, setShowDelegationModal] = React.useState<'add' | 'remove' | undefined>(undefined);

  const displayAddModal = () => setShowDelegationModal('add');
  const displayRemoveModal = () => setShowDelegationModal('remove');

  const currentStake = useAsyncMemo(async () => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    if (!account) return undefined;

    return await contracts.staking
      .getStakingAmount(account, indexerAddress)
      .then((res) => ({ era: res.era.toNumber(), value: res.valueAt, valueAfter: res.valueAfter } as EraValue));
  }, [account, indexerAddress, pendingContracts]);

  const eraValue = useEraValue(currentStake.data);

  const handleCloseModal = () => {
    setShowDelegationModal(undefined);
    // Reload because they probably have updated stake
    currentStake.refetch();
  };
  console.log('currentStake', currentStake);

  return (
    <>
      <ReactModal
        isOpen={!!showDelegationModal}
        style={newModalStyles}
        onRequestClose={() => setShowDelegationModal(undefined)}
        closeTimeoutMS={200}
      >
        <ChangeDelegationModal
          indexerAddress={indexerAddress}
          onClose={handleCloseModal}
          type={showDelegationModal ?? 'add'}
        />
      </ReactModal>
      {renderAsync(currentStake, {
        error: () => <Typography>Error getting current stake</Typography>,
        loading: () => <Spinner />,
        data: (data) => {
          return (
            <>
              <Typography>{`Your stake (next era): ${
                eraValue ? currentEraValueToString(eraValue, utils.formatEther) : '0'
              } SQT`}</Typography>
              <Button
                label={`${account === indexerAddress ? 'Stake' : 'Delegate'} SQT`}
                onClick={displayAddModal}
                disabled={!account}
              />
              <Button
                label={`Remove ${account === indexerAddress ? 'Staked' : 'Delegated'} SQT`}
                disabled={!account && BigNumber.from(eraValue?.after).isZero()}
                onClick={displayRemoveModal}
              />
            </>
          );
        },
      })}
    </>
  );
};

export default OwnDelegation;
