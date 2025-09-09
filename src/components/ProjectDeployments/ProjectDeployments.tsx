// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import Copy from '@components/Copy';
import DoBooster from '@components/DoBooster';
import Expand from '@components/Expand/Expand';
import GetEndpoint from '@components/GetEndpoint';
import { useWeb3 } from '@containers';
import { useCreateDeployment } from '@hooks';
import { ProjectDetailsQuery } from '@hooks/useProjectFromQuery';
import { useWaitTransactionhandled } from '@hooks/useWaitTransactionHandled';
import { Markdown, Modal, openNotification, Spinner, TableTitle, Typography } from '@subql/components';
import { Project } from '@subql/react-hooks/dist/graphql';
import { cidToBytes32, parseError } from '@utils';
import { useUpdate } from 'ahooks';
import { Checkbox, Form, Radio, Table } from 'antd';
import { useForm } from 'antd/es/form/Form';
import dayjs from 'dayjs';

import { useWeb3Store } from 'src/stores';

import { NewDeployment, ProjectDetails } from '../../models';
import styles from './ProjectDeployments.module.less';

type Deployment = NewDeployment & { createdAt?: Date };

type Props = {
  deployments: Deployment[];
  projectId: string;
  project: ProjectDetails;
  onRefresh: () => Promise<void>;
  currentDeploymentCid?: string;
};

const ProjectDeployments: React.FC<Props> = ({ deployments, project, projectId, currentDeploymentCid, onRefresh }) => {
  const { t } = useTranslation();
  const { contracts } = useWeb3Store();
  const updateDeployment = useCreateDeployment(projectId);
  const [loading, setLoading] = React.useState<boolean>(false);
  const waitTransactionHandled = useWaitTransactionhandled();
  const [deploymentModal, setDeploymentModal] = React.useState<boolean>(false);
  const [form] = useForm();
  const [currentDeployment, setCurrentDeployment] = React.useState<Deployment>();
  const update = useUpdate();
  const [ruleTips, setRuleTips] = React.useState<string>('');
  const handleSubmitUpdate = async () => {
    try {
      if (!form.getFieldValue('description')) {
        setRuleTips('Please provide a description for this deployment');
        return;
      } else {
        setRuleTips('');
      }
      await updateDeployment({
        ...currentDeployment,
        ...form.getFieldsValue(true),
      });
      await onRefresh();
      form.resetFields();
      setDeploymentModal(false);
    } catch (e) {
      openNotification({
        type: 'error',
        description: parseError(e),
      });
    }
  };

  return (
    <>
      <Modal
        open={deploymentModal}
        onCancel={() => setDeploymentModal(false)}
        title="Edit Deployment"
        width={572}
        cancelButtonProps={{
          style: {
            display: 'none',
          },
        }}
        okText="Update"
        onSubmit={handleSubmitUpdate}
        forceRender
      >
        <div>
          <Form form={form} layout="vertical">
            <Form.Item
              initialValue={currentDeployment?.description}
              label="Deployment Description"
              rules={[{ required: true }]}
              required
              help={ruleTips}
            >
              <div className={styles.markdownWrapper}>
                <Markdown
                  value={form.getFieldValue('description')}
                  onChange={(e) => {
                    if (!e) {
                      setRuleTips('Please provide a description for this deployment');
                    } else {
                      setRuleTips('');
                    }
                    form.setFieldValue('description', e);
                    update();
                  }}
                ></Markdown>
              </div>
            </Form.Item>
          </Form>
        </div>
      </Modal>
      <Table
        columns={[
          {
            dataIndex: 'version',
            key: 'version',
            title: <TableTitle>{t('deployments.header1')}</TableTitle>,
            render: (val) => (
              <Typography className="overflowEllipsis" style={{ maxWidth: 150 }}>
                {val}
              </Typography>
            ),
          },
          {
            dataIndex: 'deploymentId',
            key: 'deploymentId',
            title: <TableTitle>RECOMMENDED</TableTitle>,
            render: (val) =>
              loading ? (
                <Spinner size={10}></Spinner>
              ) : (
                <p className={styles.value}>
                  <Radio
                    checked={currentDeploymentCid === val}
                    onClick={async () => {
                      if (currentDeploymentCid !== val) {
                        try {
                          const res = await contracts?.projectRegistry.setProjectLatestDeployment(
                            projectId,
                            cidToBytes32(val),
                          );
                          setLoading(true);

                          const receipt = await res?.wait(10);
                          await waitTransactionHandled(receipt?.blockNumber);

                          await onRefresh();
                        } finally {
                          setLoading(false);
                        }
                      }
                    }}
                  >
                    RECOMMENDED
                  </Radio>
                </p>
              ),
          },
          {
            dataIndex: 'deploymentId',
            key: 'deploymentIdText',
            title: <TableTitle>{t('deployments.header2')}</TableTitle>,
            render: (val) => (
              <div className={styles.deploymentId}>
                <p className={styles.value}>{val}</p>
                <Copy value={val} className={styles.copy} />
              </div>
            ),
          },
          {
            dataIndex: 'description',
            key: 'description',
            title: <TableTitle>{t('deployments.header3')}</TableTitle>,
            render: (val) => (
              <div className={styles.descriptionMarkdown}>
                <Expand>
                  <Markdown.Preview>{val}</Markdown.Preview>
                </Expand>
              </div>
            ),
          },
          {
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 180,
            title: <TableTitle>{t('deployments.header4')}</TableTitle>,
            render: (val) => <p className={styles.value}>{val ? dayjs(val).utc(true).fromNow() : 'N/A'}</p>,
          },
          {
            dataIndex: 'version',
            key: 'version',
            title: <TableTitle>{t('general.action')}</TableTitle>,
            render: (_, record) => (
              <div className="flex" style={{ gap: 10 }}>
                <Typography.Link
                  type="info"
                  onClick={() => {
                    setCurrentDeployment(record);
                    setDeploymentModal(true);
                    form.setFieldValue('description', record.description);
                    form.setFieldValue('recommended', currentDeploymentCid === record.deploymentId);
                  }}
                >
                  Edit
                </Typography.Link>

                <DoBooster
                  deploymentId={record.deploymentId}
                  projectId={projectId}
                  actionBtn={<Typography.Link type="info">Booster</Typography.Link>}
                ></DoBooster>

                <GetEndpoint
                  project={project as any}
                  deploymentId={record.deploymentId}
                  actionBtn={<Typography.Link type="info">Get Endpoint</Typography.Link>}
                ></GetEndpoint>
              </div>
            ),
            fixed: 'right',
          },
        ]}
        dataSource={deployments}
        rowKey={(record) => record.deploymentId}
      ></Table>
    </>
  );
};

export default ProjectDeployments;
