// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useNavigate } from 'react-router';
import { useProjectList } from '@hooks/useProjectList';
import { usePropsValue } from '@hooks/usePropsValue';
import { Modal, Typography } from '@subql/components';
import { Form, Input } from 'antd';
import { useForm } from 'antd/es/form/Form';

import { useWeb3 } from '../../../containers';
import { ROUTES } from '../../../utils';

const { STUDIO_CREATE_NAV, STUDIO_PROJECT_NAV } = ROUTES;

export const PublishNewProjectModal: React.FC<{ value: boolean; onChange: (val: boolean) => void }> = ({
  value,
  onChange,
}) => {
  const navigate = useNavigate();
  const [form] = useForm();
  const [showCreateModal, setShowCreateModal] = usePropsValue<boolean>({
    value,
    onChange,
    defaultValue: false,
  });
  const handleCreateProject = () => {
    navigate(
      `${STUDIO_CREATE_NAV}?name=${encodeURI(form.getFieldValue('projectName'))}&deploymentId=${form.getFieldValue(
        'deploymentId',
      )}`,
    );
  };

  return (
    <Modal
      title="Publish Your Own Project to the Decentralised Network"
      width={572}
      open={showCreateModal}
      onCancel={() => setShowCreateModal(false)}
      onOk={async () => {
        await form.validateFields();

        handleCreateProject();
      }}
      okText={'Next'}
      okButtonProps={{
        shape: 'round',
        size: 'large',
      }}
      cancelButtonProps={{
        style: { display: 'none' },
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '24px 0' }}>
        <Typography style={{ color: 'var(--sq-gray700)' }}>
          Please enter the deployment ID of your SubQuery project below. To get the deployment ID, run subql publish
          from your project code to publish it to IPFS. Learn how to publish a SubQuery project here.
        </Typography>

        <Form layout="vertical" form={form}>
          <Form.Item label="Deployment ID" name="deploymentId" rules={[{ required: true }]}>
            <Input placeholder="Deployment ID" size="large"></Input>
          </Form.Item>
          <div>
            <Form.Item label="Project Name" name="projectName" rules={[{ required: true }]}>
              <Input placeholder="Project Name" size="large"></Input>
            </Form.Item>
            <Typography variant="medium">Project names should be unique, you can edit this later.</Typography>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

const Home: React.FC = () => {
  const { account } = useWeb3();
  const navigate = useNavigate();
  const { listsWithSearch } = useProjectList({
    account,
    onProjectClick: (projectId) => {
      navigate(`${STUDIO_PROJECT_NAV}/${projectId}`);
    },
  });

  return (
    <div className="content-width" style={{ padding: '80px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
        <Typography variant="h4">My Projects</Typography>
      </div>

      {listsWithSearch}
    </div>
  );
};

export default Home;
