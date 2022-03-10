// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useContracts, usePlans, usePlanTemplates, useWeb3 } from '../../containers';
import { cidToBytes32, mapAsync, newModalStyles, notEmpty, renderAsyncArray } from '../../utils';
import { Button, Modal, Spinner, Typography } from '@subql/react-ui';
import { Table, TableHead, TableBody, TableRow, TableCell } from '@subql/react-ui/dist/components/Table';
import { GetPlanTemplates_planTemplates_nodes as PlanTemplate } from '../../__generated__/GetPlanTemplates';
import { BigNumber } from '@ethersproject/bignumber';
import assert from 'assert';
import { ethers, utils } from 'ethers';
import { Form, Formik } from 'formik';
import * as yup from 'yup';
import { FTextInput } from '../../components';
import ReactModal from 'react-modal';
import { GetPlans_plans_nodes as Plan } from '../../__generated__/GetPlans';

const NewPlanSchema = yup.object({
  price: yup.number().required(),
  deploymentId: yup.string().optional(),
});

type NewPlanFormProps = yup.Asserts<typeof NewPlanSchema>;

const PlanTemplateRow: React.VFC<{ planTemplate: PlanTemplate; onCreatePlan?: () => void }> = ({
  planTemplate,
  onCreatePlan,
}) => {
  return (
    <TableRow>
      <TableCell>
        <Typography>{planTemplate.id}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{BigNumber.from(planTemplate.period).toNumber()}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{BigNumber.from(planTemplate.dailyReqCap).toNumber()}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{BigNumber.from(planTemplate.rateLimit).toNumber()}</Typography>
      </TableCell>
      <TableCell>
        <Button label="Create Plan" onClick={onCreatePlan} />
      </TableCell>
    </TableRow>
  );
};

const PlanRow: React.VFC<{ plan: Plan; onRemovePlan?: () => void }> = ({ plan, onRemovePlan }) => {
  return (
    <TableRow>
      <TableCell>
        <Typography>{plan.id}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{utils.formatEther(BigNumber.from(plan.price))}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{plan.deploymentId}</Typography>
      </TableCell>
      <TableCell>
        <Button label="Remove Plan" onClick={onRemovePlan} />
      </TableCell>
    </TableRow>
  );
};

const CreatePlanModal: React.VFC<{ onSubmit: (data: NewPlanFormProps) => Promise<void> }> = ({ onSubmit }) => {
  return (
    <Formik
      initialValues={{
        price: 0,
        deploymentId: '',
      }}
      validationSchema={NewPlanSchema}
      onSubmit={onSubmit}
    >
      {({ submitForm }) => (
        <Modal title="Create new Plan" submitText="create" onSubmit={submitForm}>
          <Form>
            <FTextInput label="Price" id="price" />
            <FTextInput label="Deployment Id" id="deploymentId" />
          </Form>
        </Modal>
      )}
    </Formik>
  );
};

const Plans: React.VFC = () => {
  const { account } = useWeb3();
  const pendingContracts = useContracts();

  const planTemplates = usePlanTemplates({});
  const plans = usePlans({ address: account ?? '' });

  const [showNewPlanModal, setShowNewPlanModal] = React.useState<string | undefined>(undefined);

  const handleCreatePlan = async (data: NewPlanFormProps) => {
    const contracts = await pendingContracts;

    assert(contracts, 'Contracts not available');
    assert(showNewPlanModal, 'Plan ID not specified');

    const tx = await contracts.planManager.createPlan(
      utils.parseEther(data.price.toString()),
      showNewPlanModal,
      data.deploymentId ? cidToBytes32(data.deploymentId) : ethers.constants.HashZero,
    );

    await tx.wait();

    setShowNewPlanModal(undefined);
    plans.refetch();
  };

  const handleRemovePlan = async (planId: string) => {
    const contracts = await pendingContracts;

    assert(contracts, 'Contracts not available');

    const tx = await contracts.planManager.removePlan(planId);

    await tx.wait();

    plans.refetch();
  };

  return (
    <>
      <Typography variant="h5">Plan templates</Typography>
      <ReactModal
        isOpen={!!showNewPlanModal}
        style={newModalStyles}
        onRequestClose={() => setShowNewPlanModal(undefined)}
      >
        <CreatePlanModal onSubmit={handleCreatePlan} />
      </ReactModal>
      {renderAsyncArray(
        mapAsync((d) => d.planTemplates?.nodes.filter(notEmpty), planTemplates),
        {
          loading: () => <Spinner />,
          error: (e) => <Typography>{`Error loading plan templates: ${e}`}</Typography>,
          empty: () => <Typography>No plan templates</Typography>,
          data: (data) => (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Id</TableCell>
                    <TableCell>Period</TableCell>
                    <TableCell>Daily Request Cap</TableCell>
                    <TableCell>Rate Limit</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((d) => (
                    <PlanTemplateRow key={d.id} planTemplate={d} onCreatePlan={() => setShowNewPlanModal(d.id)} />
                  ))}
                </TableBody>
              </Table>
            </>
          ),
        },
      )}
      <Typography variant="h5">Your plans</Typography>
      {renderAsyncArray(
        mapAsync((d) => d.plans?.nodes.filter(notEmpty), plans),
        {
          loading: () => <Spinner />,
          error: (e) => <Typography>{`Error loading plans: ${e}`}</Typography>,
          empty: () => <Typography>No plans</Typography>,
          data: (data) => (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Id</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>DeploymentId</TableCell>
                  {/*<TableCell>Rate Limit</TableCell>*/}
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((d) => (
                  <PlanRow key={d.id} plan={d} onRemovePlan={() => handleRemovePlan(d.id)} />
                ))}
              </TableBody>
            </Table>
          ),
        },
      )}
    </>
  );
};

export default Plans;
