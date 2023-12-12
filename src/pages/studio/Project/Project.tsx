// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useNavigate, useParams } from 'react-router';
import { ExternalLink } from '@components/ProjectOverview/ProjectOverview';
import { Markdown, Typography } from '@subql/components';
import { Breadcrumb, Form, Input, Modal } from 'antd';
import { useForm } from 'antd/es/form/Form';
import clsx from 'clsx';

import { IPFSImage, Spinner } from '../../../components';
import { useWeb3 } from '../../../containers';
import { useCreateDeployment, useProject } from '../../../hooks';
import { renderAsync } from '../../../utils';
import DeploymentsTab from './Deployments';
import styles from './Project.module.css';

const Project: React.FC = () => {
  const { id } = useParams();
  const { account } = useWeb3();
  const asyncProject = useProject(id ?? '');
  const navigate = useNavigate();
  const [form] = useForm();
  const [deploymentModal, setDeploymentModal] = React.useState<boolean>(false);
  const createDeployment = useCreateDeployment(id ?? '');

  const handleSubmitCreate = async () => {
    await form.validateFields();
    await createDeployment(form.getFieldsValue());
    form.resetFields();
    setDeploymentModal(false);
  };

  return renderAsync(asyncProject, {
    loading: () => <Spinner />,
    error: (error: Error) => <span>{`Failed to load project: ${error.message}`}</span>,
    data: (project) => {
      if (!project) {
        // Should never happen
        return <span>Project doesn't exist</span>;
      }

      // @ts-expect-error
      // if (project.owner !== account) {
      //   navigate('/studio');
      // }

      return (
        <div>
          <Modal
            open={deploymentModal}
            onCancel={() => setDeploymentModal(false)}
            title="Add New Deployment Version"
            width={572}
            cancelButtonProps={{
              style: {
                display: 'none',
              },
            }}
            okText="Add"
            okButtonProps={{
              shape: 'round',
              size: 'large',
            }}
            onOk={() => {
              handleSubmitCreate();
            }}
          >
            <div style={{ padding: '12px 0' }}>
              <Form form={form} layout="vertical">
                <Form.Item label="Deployment ID" name="deploymentId" rules={[{ required: true }]}>
                  <Input size="large" placeholder="Enter deployment Id"></Input>
                </Form.Item>
                <Form.Item label="Version" name="version" rules={[{ required: true }]}>
                  <Input size="large" placeholder="Enter version"></Input>
                </Form.Item>
                <Form.Item label="Deployment Description" name="deploymentDesc" rules={[{ required: true }]}>
                  <Markdown
                    value={form.getFieldValue('deploymentDesc')}
                    onChange={(e) => {
                      form.setFieldValue('deploymentDesc', e);
                    }}
                  ></Markdown>
                </Form.Item>
              </Form>
            </div>
          </Modal>
          <div
            className="content-width"
            style={{ padding: '24px 80px 0 80px', display: 'flex', flexDirection: 'column' }}
          >
            <Breadcrumb
              items={[
                {
                  key: 'explorer',
                  title: (
                    <Typography variant="medium" type="secondary" style={{ cursor: 'pointer' }}>
                      SubQuery Projects
                    </Typography>
                  ),
                  onClick: () => {
                    navigate('/studio');
                  },
                },
                {
                  key: 'current',
                  title: project.metadata.name,
                },
              ]}
            ></Breadcrumb>

            <div style={{ display: 'flex', gap: 24, marginTop: 24 }}>
              <IPFSImage
                src={project.metadata.image || '/static/default.project.png'}
                style={{ width: 160, height: 160 }}
              />{' '}
              <div className="col-flex" style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <Typography variant="h4" weight={600}>
                    {project.metadata.name}
                  </Typography>
                </div>
              </div>
            </div>

            <Typography variant="large" weight={600} style={{ marginBottom: 24 }}>
              Project Detail
            </Typography>

            <div style={{ marginBottom: 16 }}>
              <Markdown.Preview>{project.metadata.description}</Markdown.Preview>
            </div>

            <ExternalLink icon="globe" link={project.metadata.websiteUrl} />
            <ExternalLink icon="github" link={project.metadata.codeUrl} />

            <div
              style={{ height: 1, width: '100%', background: 'var(--sq-gray300)', marginTop: 8, marginBottom: 24 }}
            ></div>
          </div>

          <div className={clsx('content-width', styles.content)}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="large" weight={600}>
                Deployment Details
              </Typography>

              <Typography.Link
                active
                weight={500}
                onClick={() => {
                  setDeploymentModal(true);
                }}
              >
                Deploy New Version
              </Typography.Link>
            </div>
            <DeploymentsTab
              projectId={id ?? ''}
              currentDeployment={project && { deployment: project.deploymentId, version: project.version }}
            />
          </div>
        </div>
      );
    },
  });
};

export default Project;
