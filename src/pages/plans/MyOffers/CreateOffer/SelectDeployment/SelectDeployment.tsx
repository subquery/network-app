// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Typography } from 'antd';
import { CreateOfferContext, StepButtons } from '../CreateOffer';
import styles from './SelectDeployment.module.css';
import { useHistory } from 'react-router';
import { EXPLORER_ROUTE } from '../../../../explorer';
import { DeploymentInfo, SearchInput, Spinner } from '../../../../../components';
import { useDeploymentQuery } from '../../../../../containers';
import { useProject } from '../../../../../hooks';
import { renderAsync } from '../../../../../utils';

const Description = () => {
  const history = useHistory();
  return (
    <div className={styles.description}>
      <Typography.Text type="secondary">
        <Trans i18nKey="myOffers.step_1.description">
          You can copy & paste the deployment ID of your desired project by entering their project detail page from
          <Button type="link" onClick={() => history.push(EXPLORER_ROUTE)} className={styles.descriptionBtn}>
            explorer
          </Button>
          .
        </Trans>
      </Typography.Text>
    </div>
  );
};

export const SelectDeployment: React.VFC = () => {
  const { t } = useTranslation();
  const createOfferContext = React.useContext(CreateOfferContext);

  /**
   * SearchInput logic
   */
  const [searchDeployment, setSearchDeployment] = React.useState<string | undefined>(
    createOfferContext?.offer?.deploymentId,
  );
  const sortedDeployment = useDeploymentQuery({ deploymentId: searchDeployment ?? '' });
  const searchedDeployment = React.useMemo(() => sortedDeployment.data?.deployment, [sortedDeployment]);

  const SearchAddress = () => (
    <SearchInput
      onSearch={(value) => setSearchDeployment(value)}
      onChange={(e) => !e.target.value && setSearchDeployment(undefined)}
      defaultValue={searchDeployment || createOfferContext?.offer?.deploymentId}
      loading={sortedDeployment.loading}
      emptyResult={!searchedDeployment}
      placeholder={t('myOffers.step_1.search')}
    />
  );

  /**
   * SearchInput logic end
   */

  if (!createOfferContext) return <></>;
  const { curStep, onStepChange, totalSteps, updateCreateOffer, offer } = createOfferContext;
  const onNext = (step: number) => {
    updateCreateOffer({ ...offer, deploymentId: searchedDeployment?.id });
    onStepChange(step);
  };

  const DeploymentProject = ({ projectId }: { projectId: string }) => {
    const asyncProject = useProject(projectId);
    return (
      <div className={styles.deploymentInfoContainer}>
        <Typography.Title level={5}>{t('myOffers.step_1.selectedId')}</Typography.Title>
        {renderAsync(asyncProject, {
          loading: () => <Spinner />,
          error: (error) => <p>{`Failed to load project: ${error.message}`}</p>,
          data: (project) => {
            if (!project) {
              return <></>;
            }
            return (
              <div className={styles.deploymentInfo}>
                <DeploymentInfo deploymentId={project.deploymentId} project={project.metadata} />{' '}
              </div>
            );
          },
        })}
      </div>
    );
  };

  return (
    <div>
      <Typography.Title level={4}>{t('myOffers.step_1.title')}</Typography.Title>
      <Description />
      <div className={styles.searchDeployment}>
        <SearchAddress />
        {searchedDeployment?.projectId && <DeploymentProject projectId={searchedDeployment?.projectId} />}
        <StepButtons
          totalSteps={totalSteps}
          curStep={curStep}
          onStepChange={onNext}
          disabled={!searchedDeployment?.projectId}
        />
      </div>
    </div>
  );
};
