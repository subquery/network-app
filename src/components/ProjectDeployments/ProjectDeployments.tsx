// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateDeployment } from '@hooks';
import { Markdown, Modal, openNotification, Typography } from '@subql/components';
import { parseError } from '@utils';
import { Form, Radio } from 'antd';
import { useForm } from 'antd/es/form/Form';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { NewDeployment } from '../../models';
import { Table, TableBody, TableCell, TableHead, TableRow } from '../Table';
import { Copy } from '..';
import styles from './ProjectDeployments.module.less';

dayjs.extend(utc);

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
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>{t('deployments.header1')}</TableCell>
            <TableCell>RECOMMENDED</TableCell>
            <TableCell>{t('deployments.header2')}</TableCell>
            <TableCell>{t('deployments.header3')}</TableCell>
            <TableCell>{t('deployments.header4')}</TableCell>
            <TableCell>{t('general.action')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {deployments.map((deployment, index) => (
            <TableRow key={index}>
              <TableCell>
                <p className={styles.value}>{deployment.version}</p>
              </TableCell>
              <TableCell>
                <p className={styles.value}>
                  <Radio checked={currentDeploymentCid === deployment.deploymentId}>RECOMMENDED</Radio>
                </p>
              </TableCell>
              <TableCell>
                <div className={styles.deploymentId}>
                  <p className={styles.value}>{deployment.deploymentId}</p>
                  <Copy value={deployment.deploymentId} className={styles.copy} />
                </div>
              </TableCell>
              <TableCell>
                <div className={styles.descriptionMarkdown}>
                  <Markdown.Preview>{deployment.description}</Markdown.Preview>
                </div>
              </TableCell>
              <TableCell>
                <p className={styles.value}>
                  {deployment.createdAt ? dayjs(deployment.createdAt).utc(true).fromNow() : 'N/A'}
                </p>
              </TableCell>
              <TableCell>
                <Typography.Link
                  active
                  onClick={() => {
                    form.setFieldValue('description', deployment.description || '');
                    setCurrentDeployment(deployment);
                    setDeploymentModal(true);
                  }}
                >
                  Edit
                </Typography.Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default ProjectDeployments;
