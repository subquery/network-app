// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router';
import NormalError from '@components/NormalError';
import ProjectHeader from '@components/ProjectHeader';
import ProjectOverview from '@components/ProjectOverview';
import { TabButtons } from '@components/TabButton';
import { useGetDeploymentManifest } from '@hooks/useGetDeploymentManifest';
import { useGetIfUnsafeDeployment } from '@hooks/useGetIfUnsafeDeployment';
import { captureMessage } from '@sentry/react';
import { Spinner, Typography } from '@subql/components';
import { ProjectType } from '@subql/network-query';
import { useGetProjectDeploymentsQuery } from '@subql/react-hooks';
import { parseError } from '@utils';
import { Breadcrumb } from 'antd';

import IndexerDetails from '../../../components/IndexerDetails';
import { useProjectMetadata } from '../../../containers';
import { useDeploymentMetadata, useProjectFromQuery, useRouteQuery } from '../../../hooks';
import { renderAsync, ROUTES } from '../../../utils';
import DeploymentGraphqlAgent from './components/deploymentGraphqlAgent';
import styles from './Project.module.less';

const { OVERVIEW, INDEXERS } = ROUTES;

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
      {
        link: `graphql-agent${location.search}`,
        label: 'GraphQL Agents',
      },
    ];

    return [...tabList];
  }, [location.search, asyncProject.data?.type]);

  const deploymentId = React.useMemo(() => {
    return query.get('deploymentId') || asyncProject.data?.deploymentId;
  }, [asyncProject]);

  const asyncDeploymentMetadata = useDeploymentMetadata(deploymentId);
  const { isUnsafe } = useGetIfUnsafeDeployment(deploymentId);
  const { manifest } = useGetDeploymentManifest(deploymentId);

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

  return (
    <>
      {renderAsync(asyncProject, {
        loading: () => (
          <div
            style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Spinner></Spinner>
          </div>
        ),
        error: (e) => (
          <NormalError withWrapper>
            This project looks like have wrong metadata, Please contact the project creator to fix it.
          </NormalError>
        ),
        data: (project) => {
          if (!project) {
            // Should never happen
            return <span>Project doesn&apos;t exist</span>;
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
                        navigate(
                          `/explorer/home?category=${asyncProject.data?.type === ProjectType.RPC ? 'rpc' : 'subquery'}`,
                        );
                      },
                    },
                    {
                      key: 'current',
                      title: (
                        <Typography variant="medium" className="overflowEllipsis" style={{ maxWidth: 300 }}>
                          {project.metadata.name}
                        </Typography>
                      ),
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
                    manifest={manifest}
                  />
                </div>
                <TabButtons tabs={sortedTabList} withUnderline />
              </div>
              <div className={styles.contentOverview}>
                {/* Dbsize is fetch from this section, make it to the store then displaying at header. 
                    side effects in this section.  */}
                <div style={{ display: location.pathname.includes(INDEXERS) ? 'block' : 'none' }}>
                  <IndexerDetails deploymentId={deploymentId} project={project} manifest={manifest}></IndexerDetails>
                </div>
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
                  <Route path={INDEXERS} element={<></>} />
                  <Route
                    path="graphql-agent"
                    element={
                      <DeploymentGraphqlAgent project={project} deploymentId={deploymentId}></DeploymentGraphqlAgent>
                    }
                  ></Route>

                  <Route path={'/'} element={<Navigate replace to={`${OVERVIEW}${location.search}`} />} />
                </Routes>
              </div>
            </div>
          );
        },
      })}
    </>
  );
};

export default ProjectInner;
