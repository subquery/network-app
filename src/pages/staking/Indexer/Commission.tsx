// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Button, Modal, Spinner, Typography } from '@subql/react-ui';
import assert from 'assert';
import { BigNumber } from 'ethers';
import { Form, Formik } from 'formik';
import React from 'react';
import ReactModal from 'react-modal';
import * as yup from 'yup';
import { FTextInput } from '../../../components';
import { useContracts, useWeb3 } from '../../../containers';
import { useAsyncMemo, useEraValue } from '../../../hooks';
import { currentEraValueToString, EraValue } from '../../../hooks/useEraValue';
import { newModalStyles, renderAsync } from '../../../utils';

const CommissionSchema = yup.object({
  amount: yup
    .number()
    .min(0)
    .max(100)
    .test(
      'maxDecimalPlaces',
      'Commission rate can only be to 2 decimal places',
      (value) => !!value && Number.isInteger(value * 10 ** 2),
    )
    .required(),
});
type CommissionFormProps = yup.Asserts<typeof CommissionSchema>;

const CommissionModal: React.VFC<{ currentAmount: number; onClose: () => void }> = ({ currentAmount, onClose }) => {
  const pendingContracts = useContracts();

  const updateCommission = async (data: CommissionFormProps) => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    // TODO validation
    const tx = await contracts.indexerRegistry.setCommissionRate(Math.floor(data.amount * 10));

    await tx.wait();

    onClose();
  };

  return (
    <Formik
      initialValues={{ amount: currentAmount }}
      validationSchema={CommissionSchema.shape({})}
      onSubmit={updateCommission}
    >
      {({ submitForm }) => (
        <Modal title={`Update your commission rate`} submitText="Update" onSubmit={submitForm}>
          <Form>
            <FTextInput label="Percent" id="amount" />
          </Form>
        </Modal>
      )}
    </Formik>
  );
};

const Commission: React.VFC<{ indexerAddress: string }> = ({ indexerAddress }) => {
  const { account } = useWeb3();

  const pendingContracts = useContracts();
  const [showCommissionModal, setShowCommissionModal] = React.useState<boolean>(false);

  const commission = useAsyncMemo(async (): Promise<EraValue> => {
    const contracts = await pendingContracts;
    assert(contracts, 'Contracts not available');

    // TODO should this be an Era Value
    return contracts.indexerRegistry.commissionRates(indexerAddress).then((v) => ({
      era: v.era.toNumber(),
      value: v.valueAt,
      valueAfter: v.valueAfter,
    }));
  }, [indexerAddress, pendingContracts]);

  const commissionValue = useEraValue(commission?.data);

  return (
    <div>
      <ReactModal
        isOpen={showCommissionModal}
        style={newModalStyles}
        onRequestClose={() => setShowCommissionModal(true)}
        closeTimeoutMS={200}
      >
        <CommissionModal
          currentAmount={BigNumber.from(commission.data?.valueAfter ?? 0).toNumber()}
          onClose={() => setShowCommissionModal(true)}
        />
      </ReactModal>
      {renderAsync(commission, {
        loading: () => (
          <>
            <Typography>{`Commission loading`}</Typography>
            <Spinner />
          </>
        ),
        error: (e) => <Typography>{`Unable to load commission: ${e.message}`}</Typography>,
        data: (data) => (
          <Typography>
            {`Commission: ${
              commissionValue
                ? currentEraValueToString(commissionValue, (v) => (BigNumber.from(v).toNumber() / 10).toFixed(2))
                : ''
            }%`}
          </Typography>
        ),
      })}
      {account === indexerAddress && <Button label="Change Commission" onClick={() => setShowCommissionModal(true)} />}
    </div>
  );
};

export default Commission;
