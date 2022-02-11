// Copyright 2020-2022 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import assert from 'assert';
import { parseEther } from '@ethersproject/units';
import { BigNumber, utils } from 'ethers';
import { Button, Modal, Spinner, Typography } from '@subql/react-ui';
import { Form, Formik } from 'formik';
import * as React from 'react';
import ReactModal from 'react-modal';
import { useHistory, useParams } from 'react-router';
import * as yup from 'yup';
import { useContracts, useIndexer, useIndexerDelegators, useWeb3 } from '../../../containers';
import { mapAsync, notEmpty, renderAsyncArray, newModalStyles, renderAsync } from '../../../utils';
import { GetIndexer_indexer as Indexer } from '../../../__generated__/GetIndexer';
import { DelegatorsList, FTextInput } from '../../../components';
import { useAsyncMemo, useEraValue } from '../../../hooks';
import { currentEraValueToString, EraValue } from '../../../hooks/useEraValue';

const Header: React.FC<{ indexer: Indexer }> = (props) => {
  return null;
};

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

  const addDelegation = async (props: DelegationFormProps) => {
    const contracts = await pendingContracts;

    assert(contracts, 'Contracts not available');

    // TODO check allowance

    const ether = parseEther(props.amount.toString());

    const tx = await (account === indexerAddress
      ? type === 'add'
        ? contracts.indexerRegistry.stake(ether)
        : contracts.indexerRegistry.unstake(ether)
      : type === 'add'
      ? contracts.staking.delegate(indexerAddress, ether)
      : contracts.staking.undelegate(indexerAddress, ether));

    await tx.wait();
    onClose();
  };

  return (
    <Formik initialValues={{ amount: 0 }} validationSchema={DelegationSchema.shape({})} onSubmit={addDelegation}>
      {({ submitForm }) => (
        <Modal title={`${type} ${action} SQT to this Indexer`} submitText={`${type} ${action}`} onSubmit={submitForm}>
          <Form>
            <FTextInput label="Amount" id="amount" />
          </Form>
        </Modal>
      )}
    </Formik>
  );
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
          onClose={() => setShowDelegationModal(undefined)}
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

const IndexerDetails: React.VFC = () => {
  const { address } = useParams<{ address: string }>();
  const history = useHistory();

  const asyncIndexer = useIndexer({ address });
  const delegators = useIndexerDelegators({ id: address });

  const handleDelegatorClick = (delegatorAddress: string) => history.push(`/staking/delegator/${delegatorAddress}`);

  return (
    <div className="content-width">
      {renderAsync(asyncIndexer, {
        loading: () => <Spinner />,
        error: (e) => <Typography>{`Unable to load indexer: ${e.message}`}</Typography>,
        data: (data) => {
          // if (!data?.indexer) {
          //   return <Typography>Indexer not found.</Typography>;
          // }

          return (
            <div>
              {/*<Header indexer={data.indexer}/>*/}

              <Typography variant="h5">Delegators</Typography>
              {/* Placeholder data */}
              <DelegatorsList
                onClick={handleDelegatorClick}
                delegators={[
                  {
                    __typename: 'Delegation',
                    delegatorAddress: '0x759Dc965026Ea8D6919451c0B1eaD337bD60ddeD',
                    amount: {
                      era: 2,
                      value: BigNumber.from(0),
                      valueAfter: BigNumber.from('1001000000000000000000'),
                    },
                  },
                ]}
              />
              {renderAsyncArray(
                mapAsync((data) => data.indexer?.delegations.nodes.filter(notEmpty), delegators),
                {
                  error: (e) => <Typography>{`Failed to get project delegators`}</Typography>,
                  loading: () => <Spinner />,
                  data: (data) => <DelegatorsList delegators={data} onClick={handleDelegatorClick} />,
                  empty: () => <Typography>No Delegators</Typography>,
                },
              )}
              <OwnDelegation indexerAddress={address} />
            </div>
          );
        },
      })}
    </div>
  );
};

export default IndexerDetails;
