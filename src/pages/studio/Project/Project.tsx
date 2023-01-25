// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router';
import Modal from 'react-modal';
import { ProjectDetail, ProjectHeader, NewDeployment, Spinner, ProjectEdit, TabButtons } from '../../../components';
import { Button } from '@subql/react-ui';
import { useCreateDeployment, useProject, useUpdateProjectMetadata } from '../../../hooks';
import { FormProjectMetadata, NewDeployment as NewDeploymentParams } from '../../../models';
import { useWeb3 } from '../../../containers';
import styles from './Project.module.css';
import { modalStyles, renderAsync } from '../../../utils';
import DeploymentsTab from './Deployments';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

const Project: React.VFC = () => {
  const { id } = useParams();
  const { account } = useWeb3();
  const asyncProject = useProject(id ?? '');
  const { t } = useTranslation();

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

  const DETAILS = 'details';
  const DEPLOYMENTS = 'deployments';

  const tabLinks = [
    { label: t('studio.project.tab1'), link: DETAILS },
    { label: t('studio.project.tab2'), link: DEPLOYMENTS },
  ];

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
              <ProjectHeader project={project} />
              <div className={styles.tabContainer}>
                <TabButtons tabs={tabLinks} />
              </div>
            </div>
          </div>
          <div className={clsx('content-width', styles.content)}>
            <Routes>
              <Route path={DETAILS}>
                {editing ? (
                  <ProjectEdit project={project} onSubmit={handleSubmitEdit} onCancel={() => setEditing(false)} />
                ) : (
                  <ProjectDetail metadata={project.metadata} onEdit={handleEditMetadata} />
                )}
              </Route>
              <Route path={DEPLOYMENTS}>
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
              </Route>
              <Route path={'/'} element={<Navigate replace to={'details'} />} />
            </Routes>
          </div>
        </div>
      );
    },
  });
};

export default Project;
