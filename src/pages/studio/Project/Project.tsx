// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useNavigate, useParams } from 'react-router';
import { ExternalLink } from '@components/ProjectOverview/ProjectOverview';
import { Markdown, Typography } from '@subql/components';
import { Breadcrumb, Button, Checkbox, Form, Input, Modal } from 'antd';
import { useForm } from 'antd/es/form/Form';
import clsx from 'clsx';

import { IPFSImage, Spinner } from '../../../components';
import { useWeb3 } from '../../../containers';
import { useCreateDeployment, useProject } from '../../../hooks';
import { parseError, renderAsync } from '../../../utils';
import DeploymentsTab, { DeploymendRef } from './Deployments';
import styles from './Project.module.css';

const Project: React.FC = () => {
  const { id } = useParams();
  const { account } = useWeb3();
  const asyncProject = useProject(id ?? '');
  const navigate = useNavigate();
  const [form] = useForm();
  const [deploymentModal, setDeploymentModal] = React.useState<boolean>(false);
  const createDeployment = useCreateDeployment(id ?? '');
  const deploymentsRef = React.useRef<DeploymendRef>(null);
  const [addDeploymentsLoading, setAddDeploymentsLoading] = React.useState(false);

  const handleSubmitCreate = async () => {
    try {
      setAddDeploymentsLoading(true);
      await form.validateFields();
      await createDeployment(form.getFieldsValue());
      await deploymentsRef.current?.refresh();
      form.resetFields();
      setDeploymentModal(false);
    } finally {
      setAddDeploymentsLoading(false);
    }
  };

  return renderAsync(asyncProject, {
    loading: () => <Spinner />,
    error: (error: Error) => {
      return <Typography>{`Failed to load project: ${parseError(error)}`}</Typography>;
    },
    data: (project) => {
      if (!project) {
        // Should never happen
        return <span>Project doesn't exist</span>;
      }

      if (project.owner !== account) {
        navigate('/studio');
      }

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
              loading: addDeploymentsLoading,
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
                <Form.Item name="recommended">
                  <Checkbox>Set as recommended version</Checkbox>
                </Form.Item>
                <Form.Item label="Deployment Description" name="description" rules={[{ required: true }]}>
                  <Markdown
                    value={form.getFieldValue('description')}
                    onChange={(e) => {
                      form.setFieldValue('description', e);
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

                  <Button
                    type="primary"
                    shape="round"
                    size="large"
                    onClick={() => {
                      navigate(`/studio/create?id=${project.id}`);
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            </div>

            <Typography variant="large" weight={600} style={{ margin: '24px 0' }}>
              Project Detail
            </Typography>

            <div style={{ marginBottom: 16 }}>
              <Markdown.Preview>{project.metadata.description}</Markdown.Preview>
            </div>

            <Typography variant="large" style={{ margin: '24px 0 8px 0' }}>
              Categories
            </Typography>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {project.metadata.categories?.map((category) => {
                return (
                  <div
                    key={category}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(67, 136, 221, 0.10)',
                      color: 'var(--sq-blue600)',
                      borderRadius: 100,
                    }}
                  >
                    {category}
                  </div>
                );
              })}
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
              ref={deploymentsRef}
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
