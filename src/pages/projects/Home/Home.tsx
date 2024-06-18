// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useNavigate } from 'react-router';
import { SettingFileIcon } from '@components/Icons/Icons';
import { useRouteQuery } from '@hooks';
import { useProjectList } from '@hooks/useProjectList';
import { usePropsValue } from '@hooks/usePropsValue';
import SubgraphAlert from '@pages/dashboard/components/SubgraphAlert/SubgraphAlert';
import { Modal, SubqlCard, Tag, Typography } from '@subql/components';
import { ProjectType } from '@subql/network-query';
import { Form, Input } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { clsx } from 'clsx';

import { ProjectType as ProjectTypeOnChain } from 'src/models';

import { useWeb3 } from '../../../containers';
import { ROUTES } from '../../../utils';
import styles from './Home.module.less';

const { STUDIO_CREATE_NAV, STUDIO_PROJECT_NAV } = ROUTES;

export const PublishNewProjectModal: React.FC<{ value: boolean; onChange: (val: boolean) => void }> = ({
  value,
  onChange,
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [selectedProjectType, setSelectedProjectType] = React.useState<ProjectTypeOnChain>(ProjectTypeOnChain.SUBQUERY);
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
      )}&type=${selectedProjectType}`,
    );
  };

  return (
    <Modal
      title="Publish New Project to the Decentralised Network"
      width={800}
      open={showCreateModal}
      onCancel={() => {
        form.resetFields();
        setCurrentStep(0);
        setShowCreateModal(false);
      }}
      onOk={async () => {
        if (currentStep === 0) {
          setCurrentStep(1);
          return;
        }

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
      {currentStep === 0 && (
        <div className="col-flex" style={{ gap: 24 }}>
          <Typography>What type of project you would like to publish?</Typography>

          <div className="flex" style={{ gap: 16, alignItems: 'unset' }}>
            <SubqlCard
              width={235}
              onClick={() => setSelectedProjectType(ProjectTypeOnChain.SUBQUERY)}
              // TODO: add active to component library
              className={clsx(
                styles.typeCard,
                selectedProjectType === ProjectTypeOnChain.SUBQUERY ? styles.active : '',
              )}
              titleExtra={
                <div className={clsx('col-flex', 'flex-center')} style={{ gap: 8 }}>
                  <SettingFileIcon style={{ color: '#FF4581' }}></SettingFileIcon>
                  <Typography>SubQuery Project</Typography>

                  <Typography
                    variant="medium"
                    type="secondary"
                    style={{ textAlign: 'center', width: '100%', whiteSpace: 'normal', wordBreak: 'break-word' }}
                  >
                    SubQuery projects provide indexed blockchain data to applications across over 200 networks
                  </Typography>
                </div>
              }
              style={{ boxShadow: 'none' }}
            ></SubqlCard>

            <SubqlCard
              width={235}
              className={clsx(
                styles.typeCard,
                selectedProjectType === ProjectTypeOnChain.SUBGRAPH ? styles.active : '',
              )}
              onClick={() => setSelectedProjectType(ProjectTypeOnChain.SUBGRAPH)}
              titleExtra={
                <div className={clsx('col-flex', 'flex-center')} style={{ gap: 8 }}>
                  <SettingFileIcon style={{ color: '#6B46EF' }}></SettingFileIcon>
                  <Typography>Subgraph Project</Typography>

                  <Typography
                    variant="medium"
                    type="secondary"
                    style={{ textAlign: 'center', width: '100%', whiteSpace: 'normal', wordBreak: 'break-word' }}
                  >
                    Subgraphs are indexed data projects from the Graph protocol. You can run existing Subgraphs on the
                    SubQuery Network.
                  </Typography>
                </div>
              }
              style={{ boxShadow: 'none' }}
            ></SubqlCard>

            <div style={{ position: 'relative', cursor: 'no-drop' }}>
              <SubqlCard
                width={235}
                titleExtra={
                  <div className="col-flex flex-center" style={{ gap: 8 }}>
                    <SettingFileIcon style={{ color: '#4388DD' }}></SettingFileIcon>
                    <Typography>RPC Endpoint</Typography>
                    <Tag color="info">Coming soon</Tag>
                    <Typography
                      variant="medium"
                      type="secondary"
                      style={{ textAlign: 'center', width: '100%', whiteSpace: 'normal', wordBreak: 'break-word' }}
                    >
                      RPC endpoints are commonly used to read and submit data to blockchains. SubQuery Network supports
                      both HTTP and websocket RPC endpoints.
                    </Typography>
                  </div>
                }
                style={{ boxShadow: 'none' }}
              ></SubqlCard>
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: '100%',
                  backgroundColor: '#DFE3E84D',
                }}
              />
            </div>
          </div>
        </div>
      )}
      {currentStep === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {selectedProjectType === ProjectTypeOnChain.SUBGRAPH && (
            <>
              <Typography>
                Subgraphs are indexed data projects from the Graph protocol. You can run existing Subgraphs on the
                SubQuery Network.
              </Typography>
              <Typography>
                To publish a Subgraph, you must obtain the deployment ID from xxx, then you can enter it below.
                <Typography.Link
                  style={{
                    textDecoration: 'underline',
                  }}
                  type="info"
                  href="https://academy.subquery.network/subquery_network/architects/publish-subgraph.html"
                  target="_blank"
                >
                  Read more about how to publish a Subgraph
                </Typography.Link>
              </Typography>
            </>
          )}

          {selectedProjectType === ProjectTypeOnChain.SUBQUERY && (
            <Typography>
              Please enter the deployment ID of your SubQuery project below. To get the deployment ID, run subql publish
              from your project code to publish it to IPFS. Learn how to publish a SubQuery project{' '}
              <Typography.Link type="info">here.</Typography.Link>
            </Typography>
          )}

          <Form layout="vertical" form={form}>
            <Form.Item
              label="Deployment ID"
              name="deploymentId"
              rules={[
                {
                  validator: async (rule, value: string) => {
                    if (!value) {
                      return Promise.reject('Please enter the deployment ID');
                    }

                    if (!value.startsWith('Qm')) {
                      return Promise.reject('The deployment ID you provided is not valid. Please check and try again');
                    }

                    if (value.length !== 46) {
                      return Promise.reject('The deployment ID you provided is not valid. Please check and try again');
                    }

                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input placeholder="Deployment ID" size="large"></Input>
            </Form.Item>
            <div>
              <Form.Item
                extra="Project names should be unique, you can edit this later."
                label="Project Name"
                name="projectName"
                rules={[
                  {
                    validator: async (rule, value: string) =>
                      value ? Promise.resolve() : Promise.reject("Please enter the project's name"),
                  },
                ]}
              >
                <Input placeholder="Project Name" size="large"></Input>
              </Form.Item>
            </div>
          </Form>
        </div>
      )}
    </Modal>
  );
};

const Home: React.FC = () => {
  const { account } = useWeb3();
  const query = useRouteQuery();

  const { listsWithSearch } = useProjectList({
    account,
    makeRedirectHref: (projectId) => {
      return `${STUDIO_PROJECT_NAV}/${projectId}`;
    },
    defaultFilterProjectType: query.get('category') === 'rpc' ? ProjectType.RPC : ProjectType.SUBQUERY,
  });

  return (
    <div>
      <SubgraphAlert></SubgraphAlert>
      <div className="content-width" style={{ padding: '80px', height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
          <Typography variant="h4">My Projects</Typography>
        </div>

        {listsWithSearch}
      </div>
    </div>
  );
};

export default Home;
