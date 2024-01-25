// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router';
import { useGetDeploymentManifest } from '@hooks/useGetDeploymentManifest';
import { useGetIfUnsafeDeployment } from '@hooks/useGetIfUnsafeDeployment';
import { ServiceAgreementsTable } from '@pages/consumer/ServiceAgreements/ServiceAgreementsTable';
import { captureMessage } from '@sentry/react';
import { Typography } from '@subql/components';
import { ProjectType } from '@subql/network-query';
import { useGetProjectDeploymentsQuery, useGetProjectOngoingServiceAgreementsQuery } from '@subql/react-hooks';
import { parseError } from '@utils';
import { Breadcrumb } from 'antd';

import { ProjectHeader, ProjectOverview, Spinner, TabButtons } from '../../../components';
import IndexerDetails from '../../../components/IndexerDetails';
import { useProjectMetadata } from '../../../containers';
import { useDeploymentMetadata, useProjectFromQuery, useRouteQuery } from '../../../hooks';
import { renderAsync, ROUTES } from '../../../utils';
import { FlexPlans } from '../FlexPlans';
import styles from './Project.module.less';

const { OVERVIEW, INDEXERS, SERVICE_AGREEMENTS, FLEX_PLANS } = ROUTES;

const ProjectInner: React.FC = () => {
  const { id } = useParams();
  const query = useRouteQuery();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { getVersionMetadata } = useProjectMetadata();
  const asyncProject = useProjectFromQuery(id ?? '');
  const { data: deployments } = useGetProjectDeploymentsQuery({
    variables: {
      projectId: id ?? '',
    },
  });

  const [deploymentVersions, setDeploymentVersions] = React.useState<Record<string, string>>();

  const sortedTabList = React.useMemo(() => {
    const tabList = [
      { link: `${OVERVIEW}${location.search}`, label: t('explorer.project.tab1') },
      {
        link: `${INDEXERS}${location.search}`,
        label: asyncProject.data?.type === ProjectType.RPC ? 'RPC Providers' : t('explorer.project.tab2'),
      },
      { link: `${SERVICE_AGREEMENTS}${location.search}`, label: t('explorer.project.tab3') },
    ];
    const flexPlanTab = [{ link: `${FLEX_PLANS}${location.search}`, label: t('explorer.project.tab4') }];
    return [...tabList, ...flexPlanTab];
  }, [location.search, asyncProject.data?.type]);

  const deploymentId = React.useMemo(() => {
    return query.get('deploymentId') || asyncProject.data?.deploymentId;
  }, [asyncProject]);

  const asyncDeploymentMetadata = useDeploymentMetadata(deploymentId);
  const { isUnsafe } = useGetIfUnsafeDeployment(deploymentId);
  const { manifest } = useGetDeploymentManifest(asyncProject.data?.type === ProjectType.RPC ? deploymentId : '');

  const handleChangeVersion = (value: string) => {
    navigate(`${location.pathname}?deploymentId=${value}`);
  };

  React.useEffect(() => {
    const getVersions = async () => {
      try {
        const versions = deployments?.project?.deployments.nodes ?? [];

        const result = await Promise.allSettled(
          versions.map(async (d) => {
            const versionResult = await getVersionMetadata(d?.metadata ?? '');
            return { ...d, versionHash: d?.metadata, version: versionResult };
          }),
        );

        const filteredVersions = result
          .map((i) => i.status === 'fulfilled' && i.value)
          .filter((i): i is Exclude<typeof i, false> => !!i);

        const calculatedVersions: { [key: string]: string } = filteredVersions.reduce(
          (acc, cur) => ({ ...acc, [cur.id as string]: cur.version.version }),
          {},
        );

        // cur.id be defined as optional.
        // but if it is undefined, will show `undefined` to user.
        if (calculatedVersions['undefined']) {
          captureMessage(JSON.stringify(result));
        }
        calculatedVersions && setDeploymentVersions(calculatedVersions);
      } catch (error) {
        parseError(error);
      }
    };

    if (deployments && !deploymentVersions) {
      getVersions();
    }
  }, [deployments, getVersionMetadata]);

  const page = renderAsync(asyncProject, {
    loading: () => <Spinner />,
    error: (e) => <span>{`Failed to load project: ${e.message}`}</span>,
    data: (project) => {
      if (!project) {
        // Should never happen
        return <span>Project doesn't exist</span>;
      }

      return (
        <div className={styles.container}>
          <div className={styles.upper}>
            <Breadcrumb
              items={[
                {
                  key: 'explorer',
                  title: (
                    <Typography variant="medium" type="secondary" style={{ cursor: 'pointer' }}>
                      Explorer
                    </Typography>
                  ),
                  onClick: () => {
                    navigate('/explorer/home');
                  },
                },
                {
                  key: 'current',
                  title: project.metadata.name,
                },
              ]}
            ></Breadcrumb>
            <div className={styles.projectHeader}>
              <ProjectHeader
                project={project}
                versions={deploymentVersions}
                currentVersion={deploymentId}
                onChangeVersion={handleChangeVersion}
                isUnsafeDeployment={isUnsafe}
              />
            </div>
            <TabButtons tabs={sortedTabList} withUnderline />
          </div>
          <div style={{ padding: '0 78px 24px 78px' }}>
            {/* TODO: just render the components rather than routes. */}
            <Routes>
              <Route
                path={OVERVIEW}
                element={
                  <ProjectOverview
                    project={project}
                    metadata={project.metadata}
                    deploymentDescription={asyncDeploymentMetadata?.data?.description}
                    manifest={manifest}
                  />
                }
              />
              <Route
                path={INDEXERS}
                element={
                  <IndexerDetails deploymentId={deploymentId} project={project} manifest={manifest}></IndexerDetails>
                }
              />
              <Route
                path={SERVICE_AGREEMENTS}
                element={
                  <ServiceAgreementsTable
                    queryFn={useGetProjectOngoingServiceAgreementsQuery}
                    queryParams={{ deploymentId }}
                  />
                }
              />
              <Route path={FLEX_PLANS} element={<FlexPlans />} />

              <Route path={'/'} element={<Navigate replace to={`${OVERVIEW}${location.search}`} />} />
            </Routes>
          </div>
        </div>
      );
    },
  });

  return page ? page : <span>Failed to load project: can't find project detail information</span>;
};

export default ProjectInner;
