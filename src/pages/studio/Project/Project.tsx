// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';
import { Navigate, Route, useParams } from 'react-router';
import { Button } from '@subql/components';
import { Typography } from 'antd';
import clsx from 'clsx';

import { NewDeployment, ProjectDetail, ProjectEdit, ProjectHeader, Spinner } from '../../../components';
import { useWeb3 } from '../../../containers';
import { useCreateDeployment, useProject, useUpdateProjectMetadata } from '../../../hooks';
import { FormProjectMetadata, NewDeployment as NewDeploymentParams } from '../../../models';
import { modalStyles, renderAsync } from '../../../utils';
import { ROUTES } from '../../../utils';
import DeploymentsTab from './Deployments';
import styles from './Project.module.css';

const { DETAILS, DEPLOYMENTS } = ROUTES;

const Project: React.FC = () => {
  const { id } = useParams();
  const { account } = useWeb3();
  const asyncProject = useProject(id ?? '');
  const { t } = useTranslation();

  const [tab, setTab] = React.useState<typeof DETAILS | typeof DEPLOYMENTS>(DETAILS);
  const [deploymentModal, setDeploymentModal] = React.useState<boolean>(false);
  const [editing, setEditing] = React.useState<boolean>(false);
  const createDeployment = useCreateDeployment(id ?? '');
  const updateMetadata = useUpdateProjectMetadata(id ?? '');

  const handleSubmitCreate = async (details: NewDeploymentParams) => {
    await createDeployment(details);
    setDeploymentModal(false);
  };

  const handleNewDeployment = () => setDeploymentModal(true);
  const handleEditMetadata = () => setEditing(true);
  const handleSubmitEdit = async (metadata: FormProjectMetadata) => {
    await updateMetadata(metadata);

    // TODO call this once tx submitted, but not confirmed
    setEditing(false);
  };

  const tabStyle = (curTab: typeof DETAILS | typeof DEPLOYMENTS) => (curTab === tab ? undefined : 'secondary');

  return renderAsync(asyncProject, {
    loading: () => <Spinner />,
    error: (error: Error) => <span>{`Failed to load project: ${error.message}`}</span>,
    data: (project) => {
      if (!project) {
        // Should never happen
        return <span>Project doesn't exist</span>;
      }

      if (project.owner !== account) {
        return <Route element={<Navigate replace to="studio" />} />;
      }

      return (
        <div>
          <Modal
            isOpen={deploymentModal}
            style={modalStyles}
            onRequestClose={() => setDeploymentModal(false)}
            closeTimeoutMS={200}
          >
            <NewDeployment onSubmit={handleSubmitCreate} onClose={() => setDeploymentModal(false)} />
          </Modal>
          <div className={styles.upper}>
            <div className="content-width">
              {/* ignore it for now. studio would refactor later. */}
              {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
              {/* @ts-ignore */}
              <ProjectHeader project={project} />
              <div className={styles.tabContainer}>
                <Typography.Text onClick={() => setTab(DETAILS)} className={`${styles.tab} `} type={tabStyle(DETAILS)}>
                  {'Details'}
                </Typography.Text>
                <Typography.Text
                  onClick={() => setTab(DEPLOYMENTS)}
                  className={styles.tab}
                  type={tabStyle(DEPLOYMENTS)}
                >
                  {'Deployments'}
                </Typography.Text>
              </div>
            </div>
          </div>
          <div className={clsx('content-width', styles.content)}>
            {tab === DETAILS && (
              <>
                {editing ? (
                  <ProjectEdit project={project} onSubmit={handleSubmitEdit} onCancel={() => setEditing(false)} />
                ) : (
                  <ProjectDetail metadata={project.metadata} onEdit={handleEditMetadata} />
                )}
              </>
            )}
            {tab === DEPLOYMENTS && (
              <div className={styles.deployments}>
                <DeploymentsTab
                  projectId={id ?? ''}
                  currentDeployment={project && { deployment: project.deploymentId, version: project.version }}
                />
                <Button
                  type="primary"
                  label={t('deployment.create.title')}
                  className={styles.deployButton}
                  onClick={handleNewDeployment}
                />
              </div>
            )}
          </div>
        </div>
      );
    },
  });
};

export default Project;
