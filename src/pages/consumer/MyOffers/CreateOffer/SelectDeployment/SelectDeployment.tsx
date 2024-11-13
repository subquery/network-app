// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { DeploymentInfo } from '@components/DeploymentInfo';
import { SearchInput } from '@components/SearchInput';
import { Spinner } from '@subql/components';
import { useGetDeploymentQuery } from '@subql/react-hooks';
import { Button, Typography } from 'antd';

import { useProject } from '../../../../../hooks';
import { renderAsync, ROUTES } from '../../../../../utils';
import { CreateOfferContext, StepButtons } from '../CreateOffer';
import styles from './SelectDeployment.module.css';

export const DeploymentProject: React.FC<{
  projectId: string;
  title?: string;
  deploymentVersion?: string;
}> = ({ title, projectId, deploymentVersion }) => {
  const { t } = useTranslation();
  const asyncProject = useProject(projectId);

  return (
    <div className={styles.deploymentInfoContainer}>
      <Typography.Title level={5}>{title ?? t('myOffers.step_0.selectedId')}</Typography.Title>
      {renderAsync(asyncProject, {
        loading: () => <Spinner />,
        error: (error) => <p>{`Failed to load project: ${error.message}`}</p>,
        data: (project) => {
          if (!project) {
            return <></>;
          }

          return (
            <div className={styles.deploymentInfo}>
              <DeploymentInfo
                type={project.type}
                deploymentId={project.deploymentId}
                project={project.metadata}
                deploymentVersion={deploymentVersion}
              />
            </div>
          );
        },
      })}
    </div>
  );
};

const Description = () => {
  return (
    <div className={styles.description}>
      <Typography.Text type="secondary">
        {}
        {/* @ts-ignore */}
        <Trans i18nKey="myOffers.step_0.description">
          You can copy & paste the deployment ID of your desired project by entering their project detail page from
          <Button type="link" href={ROUTES.EXPLORER} className={styles.descriptionBtn} target="_blank">
            explorer
          </Button>
          .
        </Trans>
      </Typography.Text>
    </div>
  );
};

export const SelectDeployment: React.FC = () => {
  const { t } = useTranslation();
  const createOfferContext = React.useContext(CreateOfferContext);

  /**
   * SearchInput logic
   */
  const [searchDeployment, setSearchDeployment] = React.useState<string | undefined>(
    createOfferContext?.offer?.deploymentId,
  );
  const sortedDeployment = useGetDeploymentQuery({ variables: { deploymentId: searchDeployment ?? '' } });
  const searchedDeployment = React.useMemo(() => sortedDeployment.data?.deployment, [sortedDeployment]);

  const SearchAddress = () => (
    <SearchInput
      onSearch={(value) => setSearchDeployment(value)}
      onChange={(e) => !e.target.value && setSearchDeployment('')}
      defaultValue={searchDeployment || createOfferContext?.offer?.deploymentId}
      loading={sortedDeployment.loading}
      emptyResult={!searchedDeployment}
      placeholder={t('myOffers.step_0.search')}
    />
  );

  /**
   * SearchInput logic end
   */

  if (!createOfferContext) return <></>;

  const searchedProjectId = searchedDeployment?.project?.id;
  const { curStep, onStepChange, updateCreateOffer, offer } = createOfferContext;
  const onNext = (step: number) => {
    updateCreateOffer({
      ...offer,
      deploymentId: searchedDeployment?.id ?? '',
      projectId: searchedProjectId ?? '',
    });
    onStepChange(step);
  };

  return (
    <div>
      <Typography.Title level={4}>{t('myOffers.step_0.title')}</Typography.Title>
      <Description />
      <div className={styles.searchDeployment}>
        <SearchAddress />
        {searchedProjectId && (
          <DeploymentProject projectId={searchedProjectId} deploymentVersion={searchedDeployment.metadata} />
        )}
        <StepButtons curStep={curStep} onStepChange={onNext} disabled={!searchedProjectId} />
      </div>
    </div>
  );
};
