// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router';
import { ServiceAgreementsTable } from '@pages/consumer/ServiceAgreements/ServiceAgreementsTable';
import { captureMessage } from '@sentry/react';
import {
  useGetDeploymentIndexersLazyQuery,
  useGetProjectDeploymentsQuery,
  useGetProjectOngoingServiceAgreementsQuery,
} from '@subql/react-hooks';
import { parseError, URLS } from '@utils';
import clsx from 'clsx';

import { EmptyList, ProjectHeader, ProjectOverview, Spinner, TabButtons } from '../../../components';
import IndexerDetails from '../../../components/IndexerDetails';
import { useProjectMetadata } from '../../../containers';
import { useDeploymentMetadata, useProjectFromQuery, useRouteQuery } from '../../../hooks';
import { notEmpty, renderAsync } from '../../../utils';
import { ROUTES } from '../../../utils';
import { FlexPlans } from '../FlexPlans';
import styles from './Project.module.css';

const { OVERVIEW, INDEXERS, SERVICE_AGREEMENTS, FLEX_PLANS } = ROUTES;

const NoIndexers: React.FC = () => {
  const { t } = useTranslation();
  return (
    <EmptyList
      title={t('noIndexers.title')}
      description={t('noIndexers.description')}
      infoLinkDesc={t('noIndexers.subtitle')}
      infoI18nKey={t('noIndexers.subtitle')}
      infoLink={URLS.INDEXER}
    />
  );
};

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
  const [loadIndexersLazy, asyncIndexers] = useGetDeploymentIndexersLazyQuery();

  const [offset, setOffset] = React.useState(0);
  const [deploymentVersions, setDeploymentVersions] = React.useState<Record<string, string>>();

  const sortedTabList = React.useMemo(() => {
    const tabList = [
      { link: `${OVERVIEW}${location.search}`, label: t('explorer.project.tab1') },
      { link: `${INDEXERS}${location.search}`, label: t('explorer.project.tab2') },
      { link: `${SERVICE_AGREEMENTS}${location.search}`, label: t('explorer.project.tab3') },
    ];
    const flexPlanTab = [{ link: `${FLEX_PLANS}${location.search}`, label: t('explorer.project.tab4') }];
    return import.meta.env.VITE_FLEXPLAN_ENABLED === 'true' ? [...tabList, ...flexPlanTab] : tabList;
  }, [location.search]);

  const deploymentId = React.useMemo(() => {
    return query.get('deploymentId') || asyncProject.data?.currentDeployment;
  }, [asyncProject]);

  const indexers = React.useMemo(
    () => asyncIndexers.data?.deploymentIndexers?.nodes.filter(notEmpty),
    [asyncIndexers.data],
  );

  const asyncDeploymentMetadata = useDeploymentMetadata(deploymentId);

  const handleChangeVersion = (value: string) => {
    navigate(`${location.pathname}?deploymentId=${value}`);
  };

  const fetchMore = (offset: number) => {
    setOffset(offset);
  };

  const indexerDetails = renderAsync(asyncIndexers, {
    loading: () => <Spinner />,
    error: (e) => <div>{`Failed to load indexers: ${e.message}`}</div>,
    data: (data) => {
      if (!indexers?.length) {
        return <NoIndexers />;
      }
      return (
        <IndexerDetails
          indexers={indexers}
          deploymentId={deploymentId}
          totalCount={data?.deploymentIndexers?.totalCount}
          onLoadMore={fetchMore}
          offset={offset}
        />
      );
    },
  });

  React.useEffect(() => {
    const getVersions = async () => {
      try {
        const versions = deployments?.project?.deployments.nodes ?? [];

        const result = await Promise.allSettled(
          versions.map(async (d) => {
            const versionResult = await getVersionMetadata(d?.version ?? '');
            return { ...d, versionHash: d?.version, version: versionResult };
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
  }, [deploymentVersions, deployments, getVersionMetadata]);

  React.useEffect(() => {
    if (deploymentId) {
      loadIndexersLazy({
        variables: { deploymentId, offset },
      });
    }
  }, [deploymentId]);

  return renderAsync(asyncProject, {
    loading: () => <Spinner />,
    error: (e) => <span>{`Failed to load project: ${e.message}`}</span>,
    data: (project) => {
      console.warn(project);
      if (!project) {
        // Should never happen
        return <span>Project doesn't exist</span>;
      }

      return (
        <div className={styles.container}>
          <div className={styles.upper}>
            <div className={styles.projectHeader}>
              <ProjectHeader
                project={project}
                versions={deploymentVersions}
                currentVersion={deploymentId}
                onChangeVersion={handleChangeVersion}
              />
            </div>
            <TabButtons tabs={sortedTabList} />
          </div>
          <div className={clsx('content-width')}>
            <Routes>
              <Route
                path={OVERVIEW}
                element={
                  <ProjectOverview
                    metadata={project.metadata}
                    deploymentDescription={asyncDeploymentMetadata?.data?.description}
                    createdAt={project.createdTimestamp}
                    updatedAt={project.updatedTimestamp}
                  />
                }
              />
              <Route path={INDEXERS} element={indexerDetails} />
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
              {/* <Route path={`${ROUTE}/:id/playground`}>
                {renderPlayground()}
              </Route> */}
              <Route path={'/'} element={<Navigate replace to={`${OVERVIEW}${location.search}`} />} />
            </Routes>
          </div>
        </div>
      );
    },
  });
};

export const Project: React.FC = () => {
  return <ProjectInner />;
};
