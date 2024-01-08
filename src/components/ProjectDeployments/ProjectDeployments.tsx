// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import Expand from '@components/Expand/Expand';
import { useCreateDeployment } from '@hooks';
import { Markdown, Modal, openNotification, TableTitle, Typography } from '@subql/components';
import { parseError } from '@utils';
import { Form, Radio, Table } from 'antd';
import { useForm } from 'antd/es/form/Form';
import dayjs from 'dayjs';

import { NewDeployment } from '../../models';
// import { Table, TableBody, TableCell, TableHead, TableRow } from '../Table';
import { Copy } from '..';
import styles from './ProjectDeployments.module.less';

type Deployment = NewDeployment & { createdAt?: Date };

type Props = {
  deployments: Deployment[];
  projectId: string;
  onRefresh: () => Promise<void>;
  currentDeploymentCid?: string;
};

const ProjectDeployments: React.FC<Props> = ({ deployments, projectId, currentDeploymentCid, onRefresh }) => {
  const { t } = useTranslation();
  const updateDeployment = useCreateDeployment(projectId);
  const [deploymentModal, setDeploymentModal] = React.useState<boolean>(false);
  const [form] = useForm();
  const [currentDeployment, setCurrentDeployment] = React.useState<Deployment>();

  const handleSubmitUpdate = async () => {
    try {
      await form.validateFields();
      await updateDeployment({
        ...currentDeployment,
        ...form.getFieldsValue(),
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
      >
        <div>
          <Form form={form} layout="vertical">
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
      <Table
        columns={[
          {
            dataIndex: 'version',
            key: 'version',
            title: <TableTitle>{t('deployments.header1')}</TableTitle>,
            render: (val) => <Typography>{val}</Typography>,
          },
          {
            dataIndex: 'deploymentId',
            key: 'deploymentId',
            title: <TableTitle>RECOMMENDED</TableTitle>,
            render: (val) => (
              <p className={styles.value}>
                <Radio checked={currentDeploymentCid === val}>RECOMMENDED</Radio>
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
            title: <TableTitle>{t('deployments.header4')}</TableTitle>,
            render: (val) => <p className={styles.value}>{val ? dayjs(val).utc(true).fromNow() : 'N/A'}</p>,
          },
          {
            dataIndex: 'version',
            key: 'version',
            title: <TableTitle>{t('general.action')}</TableTitle>,
            render: (_, record) => (
              <Typography.Link
                active
                onClick={() => {
                  form.setFieldValue('description', record.description || '');
                  setCurrentDeployment(record);
                  setDeploymentModal(true);
                }}
              >
                Edit
              </Typography.Link>
            ),
            fixed: 'right',
          },
        ]}
        dataSource={deployments}
      ></Table>
    </>
  );
};

export default ProjectDeployments;
