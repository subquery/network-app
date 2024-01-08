// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { BsGithub, BsGlobe } from 'react-icons/bs';
import Expand from '@components/Expand/Expand';
import NewCard from '@components/NewCard';
import { useRouteQuery } from '@hooks';
import { ProjectDetailsQuery } from '@hooks/useProjectFromQuery';
import { BalanceLayout } from '@pages/dashboard';
import { Markdown, Typography } from '@subql/components';
import { formatSQT, useGetOfferCountByDeploymentIdLazyQuery } from '@subql/react-hooks';

import { ProjectMetadata } from '../../models';
import styles from './ProjectOverview.module.less';

type Props = {
  project: ProjectDetailsQuery;
  metadata: ProjectMetadata;
  deploymentDescription?: string;
};

export const ExternalLink: React.FC<{ link?: string; icon: 'globe' | 'github' }> = ({ link, icon }) => {
  return (
    <div className={styles.linkContainer}>
      {icon === 'github' ? (
        <BsGithub style={{ color: 'var(--sq-blue600)', marginRight: 8 }}></BsGithub>
      ) : (
        <BsGlobe style={{ color: 'var(--sq-blue600)', marginRight: 8 }}></BsGlobe>
      )}
      <Typography.Link href={link as string}>{link || 'N/A'}</Typography.Link>
    </div>
  );
};

const ProjectOverview: React.FC<Props> = ({ project, metadata, deploymentDescription }) => {
  const { t } = useTranslation();
  const query = useRouteQuery();

  const deploymentId = React.useMemo(() => {
    return query.get('deploymentId') || project.deploymentId;
  }, [project, query]);

  const [getOfferCounts, offerCounts] = useGetOfferCountByDeploymentIdLazyQuery({
    variables: {
      deploymentId,
    },
    defaultOptions: {
      fetchPolicy: 'network-only',
    },
  });

  React.useEffect(() => {
    getOfferCounts({
      variables: {
        deploymentId,
      },
    });
  }, [deploymentId]);

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ width: 720 }}>
          <Expand>
            <Markdown.Preview>{metadata.description || 'N/A'}</Markdown.Preview>
          </Expand>
        </div>
        <div className={styles.column} style={{ marginTop: 16 }}>
          <ExternalLink icon="globe" link={metadata.websiteUrl} />
          <ExternalLink icon="github" link={metadata.codeUrl} />
        </div>
        <div style={{ height: 1, width: '100%', background: 'var(--sq-gray300)', marginBottom: 16 }}></div>
        <div className={styles.column}>
          <Typography variant="medium" weight={600}>
            {t('projectOverview.deploymentDescription')}
          </Typography>
          <div style={{ width: 670, marginTop: 8 }}>
            <Expand>
              <Markdown.Preview>{deploymentDescription || 'N/A'}</Markdown.Preview>
            </Expand>
          </div>
        </div>
      </div>

      <div style={{ marginLeft: 48, width: '100%' }}>
        <NewCard
          style={{ width: '100%' }}
          title="Total Rewards"
          titleExtra={BalanceLayout({
            mainBalance: formatSQT(project.totalReward),
          })}
        >
          <div className="col-flex">
            <div className="flex" style={{ justifyContent: 'space-between' }}>
              <Typography variant="small" type="secondary">
                Total Indexers
              </Typography>
              <Typography variant="small">
                {project.deployments.nodes.find((i) => i?.id === deploymentId)?.indexers.totalCount || 0}
              </Typography>
            </div>

            <div className="flex" style={{ justifyContent: 'space-between', margin: '12px 0' }}>
              <Typography variant="small" type="secondary">
                Total Agreements
              </Typography>
              <Typography variant="small">
                {project.deployments.nodes.find((i) => i?.id === deploymentId)?.serviceAgreements.totalCount || 0}
              </Typography>
            </div>

            <div className="flex" style={{ justifyContent: 'space-between' }}>
              <Typography variant="small" type="secondary">
                Total Offers
              </Typography>
              <Typography variant="small">{offerCounts.data?.offers?.totalCount || 0}</Typography>
            </div>
          </div>
        </NewCard>
      </div>
    </div>
  );
};

export default ProjectOverview;
