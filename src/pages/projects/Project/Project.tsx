// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useNavigate, useParams } from 'react-router';
import Expand from '@components/Expand/Expand';
import NormalError from '@components/NormalError';
import { ExternalLink } from '@components/ProjectOverview/ProjectOverview';
import UnsafeWarn from '@components/UnsafeWarn';
import { useGetIfUnsafeDeployment } from '@hooks/useGetIfUnsafeDeployment';
import { Markdown, Modal, SubqlCheckbox, Typography } from '@subql/components';
import { Breadcrumb, Button, Form, Input } from 'antd';
import { useForm } from 'antd/es/form/Form';
import clsx from 'clsx';

import { ProjectDetails } from 'src/models';

import { IPFSImage, Spinner } from '../../../components';
import { useWeb3 } from '../../../containers';
import { useCreateDeployment, useProject } from '../../../hooks';
import { renderAsync } from '../../../utils';
import DeploymentsTab, { DeploymendRef } from './Deployments';
import styles from './Project.module.less';

export const ProjectDeploymentsDetail: React.FC<{ id?: string; project: ProjectDetails }> = ({ id, project }) => {
  const [form] = useForm();
  const createDeployment = useCreateDeployment(id ?? '');
  const { getIfUnsafeAndWarn } = useGetIfUnsafeDeployment();

  const [deploymentModal, setDeploymentModal] = React.useState<boolean>(false);
  const deploymentsRef = React.useRef<DeploymendRef>(null);

  const currentDeployment = React.useMemo(
    () => ({ deployment: project.deploymentId, version: project.version }),
    [project],
  );

  const handleSubmitCreate = async () => {
    await form.validateFields();
    const processNext = await getIfUnsafeAndWarn(form.getFieldValue('deploymentId'));
    if (processNext === 'cancel') return;
    await createDeployment(form.getFieldsValue());
    await deploymentsRef.current?.refresh();
    form.resetFields();
    setDeploymentModal(false);
  };

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
        onSubmit={async () => {
          await handleSubmitCreate();
        }}
      >
        <div>
          <Form form={form} layout="vertical">
            <Form.Item label="Deployment ID" name="deploymentId" rules={[{ required: true }]}>
              <Input size="large" placeholder="Enter deployment Id"></Input>
            </Form.Item>
            <Form.Item label="Version" name="version" rules={[{ required: true }]}>
              <Input size="large" placeholder="Enter version"></Input>
            </Form.Item>
            <Form.Item name="recommended">
              <SubqlCheckbox
                value={form.getFieldValue('recommended')}
                onChange={(e) => {
                  form.setFieldValue('recommended', e.target.checked);
                }}
              >
                Set as recommended version
              </SubqlCheckbox>
            </Form.Item>
            <Form.Item label="Deployment Description" name="description" rules={[{ required: true }]}>
              <div className={styles.markdownWrapper}>
                <Markdown
                  value={form.getFieldValue('description')}
                  onChange={(e) => {
                    form.setFieldValue('description', e);
                  }}
                ></Markdown>
              </div>
            </Form.Item>
          </Form>
        </div>
      </Modal>

      <div className={clsx(styles.content)}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="large" weight={600}>
            Deployment Details
          </Typography>

          <Typography.Link
            type="info"
            weight={500}
            onClick={() => {
              form.resetFields();
              setDeploymentModal(true);
            }}
          >
            Deploy New Version
          </Typography.Link>
        </div>
        <DeploymentsTab ref={deploymentsRef} projectId={id ?? ''} currentDeployment={currentDeployment} />
      </div>
    </div>
  );
};

const Project: React.FC = () => {
  const { id } = useParams();
  const { account } = useWeb3();
  const asyncProject = useProject(id ?? '');
  const { isUnsafe } = useGetIfUnsafeDeployment(asyncProject.data?.deploymentId);
  const navigate = useNavigate();

  return renderAsync(asyncProject, {
    loading: () => <Spinner />,
    error: (error: Error) => {
      return (
        <NormalError withWrapper>
          This project looks like have wrong metadata, Please contact the project creator to fix it.
        </NormalError>
      );
    },
    data: (project) => {
      if (!project) {
        // Should never happen
        return <span>Project doesn't exist</span>;
      }

      if (project.owner !== account) {
        navigate('/projects');
      }

      return (
        <>
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
                    navigate('/projects');
                  },
                },
                {
                  key: 'current',
                  title: (
                    <Typography variant="medium" className="overflowEllipsis" style={{ maxWidth: 300 }}>
                      {project.metadata.name}
                    </Typography>
                  ),
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
                  <Typography variant="h4" weight={600} className="overflowEllipsis" style={{ maxWidth: 500 }}>
                    {project.metadata.name}
                  </Typography>

                  <Button
                    type="primary"
                    shape="round"
                    size="large"
                    onClick={() => {
                      navigate(`/projects/create?id=${project.id}`);
                    }}
                  >
                    Edit
                  </Button>
                </div>

                <div style={{ marginTop: 8, display: 'flex' }}>{isUnsafe && <UnsafeWarn></UnsafeWarn>}</div>
              </div>
            </div>

            <Typography variant="large" weight={600} style={{ margin: '24px 0' }}>
              Project Detail
            </Typography>

            <div style={{ marginBottom: 16 }}>
              <Expand>
                <Markdown.Preview>{project.metadata.description}</Markdown.Preview>
              </Expand>
            </div>

            <Typography variant="large" style={{ margin: '24px 0 8px 0' }}>
              Categories
            </Typography>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {project.metadata.categories?.map((category) => {
                return (
                  <Button key={category} type="primary" className="staticButton" shape="round">
                    {category}
                  </Button>
                );
              })}
            </div>

            <ExternalLink icon="globe" link={project.metadata.websiteUrl} />
            <ExternalLink icon="github" link={project.metadata.codeUrl} />

            <div
              style={{ height: 1, width: '100%', background: 'var(--sq-gray300)', marginTop: 8, marginBottom: 24 }}
            ></div>
          </div>

          <ProjectDeploymentsDetail id={id} project={project}></ProjectDeploymentsDetail>
        </>
      );
    },
  });
};

export default Project;
