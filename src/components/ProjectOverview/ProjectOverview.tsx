// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { BsGithub, BsGlobe } from 'react-icons/bs';
import Expand from '@components/Expand/Expand';
import NewCard from '@components/NewCard';
import { NETWORK_NAME } from '@containers/Web3';
import { useRouteQuery } from '@hooks';
import { useEthersProviderWithPublic } from '@hooks/useEthersProvider';
import { Manifest } from '@hooks/useGetDeploymentManifest';
import { ProjectDetailsQuery } from '@hooks/useProjectFromQuery';
import { BalanceLayout } from '@pages/dashboard';
import { Markdown, Tag, Typography } from '@subql/components';
import { cidToBytes32 } from '@subql/network-clients';
import { SQNetworks } from '@subql/network-config';
import { ProjectType } from '@subql/network-query';
import { formatSQT, useGetOfferCountByDeploymentIdLazyQuery } from '@subql/react-hooks';
import { TOKEN } from '@utils';
import { useInterval } from 'ahooks';
import { BigNumber } from 'ethers';

import { useWeb3Store } from 'src/stores';

import { ProjectMetadata } from '../../models';
import { formatNumber } from '../../utils/numberFormatters';
import styles from './ProjectOverview.module.less';

type Props = {
  project: ProjectDetailsQuery;
  metadata: ProjectMetadata;
  deploymentDescription?: string;
  manifest?: Manifest;
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

const ProjectOverview: React.FC<Props> = ({ project, metadata, deploymentDescription, manifest }) => {
  const { t } = useTranslation();
  const query = useRouteQuery();
  const { contracts } = useWeb3Store();
  const provider = useEthersProviderWithPublic();

  const [accQueryRewards, setAccQueryRewards] = React.useState({
    current: BigNumber.from('0'),
    previous: BigNumber.from('0'),
  });

  const [accTotalRewards, setAccTotalRewards] = React.useState({
    current: BigNumber.from('0'),
    previous: BigNumber.from('0'),
  });

  const deploymentId = React.useMemo(() => {
    return query.get('deploymentId') || project.deploymentId;
  }, [project, query]);

  const currentBooster = React.useMemo(() => {
    return (
      project.deployments.nodes.find((i) => i?.id === deploymentId)?.deploymentBoosterSummariesByDeploymentId
        ?.groupedAggregates?.[0]?.sum?.totalAmount || '0'
    );
  }, [project, deploymentId]);

  const estimatedPerEraRewards = React.useMemo(() => {
    // 2s 1 block, 1800/per hour * 24 hours * 7 days
    const blocks = NETWORK_NAME === SQNetworks.TESTNET ? 1800 : 1800 * 24 * 7;

    const estimatedQueryRewardsPerEra = accQueryRewards.current.sub(accQueryRewards.previous).mul(blocks);

    const estimatedTotalRewardsPerEra = accTotalRewards.current.sub(accTotalRewards.previous).mul(blocks);

    return {
      estimatedQueryRewardsPerEra,
      estimatedTotalRewardsPerEra,
      estimatedAllocatedPerEraRewards: estimatedTotalRewardsPerEra.sub(estimatedQueryRewardsPerEra),
    };
  }, [accQueryRewards, accTotalRewards, deploymentId]);

  const getAccQueryRewards = async () => {
    const blockNumber = await provider?.getBlockNumber();
    const currentRewards = await contracts?.rewardsBooster.getAccQueryRewardsPerBooster(cidToBytes32(deploymentId), {
      blockTag: blockNumber,
    });
    const prevRewards = await contracts?.rewardsBooster.getAccQueryRewardsPerBooster(cidToBytes32(deploymentId), {
      blockTag: blockNumber - 1,
    });

    setAccQueryRewards({
      current: currentRewards?.[0].mul(formatSQT(currentBooster)) || BigNumber.from('0'),
      previous: prevRewards?.[0].mul(formatSQT(currentBooster)) || BigNumber.from('0'),
    });
  };

  const getAccRewards = async () => {
    const blockNumber = await provider?.getBlockNumber();
    const currentRewards = await contracts?.rewardsBooster.getAccRewardsForDeployment(cidToBytes32(deploymentId), {
      blockTag: blockNumber,
    });
    const prevRewards = await contracts?.rewardsBooster.getAccRewardsForDeployment(cidToBytes32(deploymentId), {
      blockTag: blockNumber - 1,
    });

    setAccTotalRewards({
      current: currentRewards || BigNumber.from('0'),
      previous: prevRewards || BigNumber.from('0'),
    });
  };

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

  React.useEffect(() => {
    getAccRewards();
    getAccQueryRewards();
  }, [deploymentId, currentBooster]);

  useInterval(() => {
    getAccRewards();
    getAccQueryRewards();
  }, 3000);

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 5 }}>
        <div style={{ width: '100%' }}>
          <Expand>
            <Markdown.Preview>{metadata.description || 'N/A'}</Markdown.Preview>
          </Expand>
        </div>
        <div className={styles.column} style={{ marginTop: 16 }}>
          <ExternalLink icon="globe" link={metadata.websiteUrl} />
          <ExternalLink icon="github" link={metadata.codeUrl} />
        </div>
        <div style={{ height: 1, width: '100%', background: 'var(--sq-gray300)', marginBottom: 16 }}></div>
        {project.type === ProjectType.RPC && (
          <>
            <div className={styles.column} style={{ gap: 8 }}>
              <Typography variant="h6" weight={600}>
                RPC Endpoint Details
              </Typography>
              {manifest?.chain?.chainId && (
                <div className={styles.line}>
                  <Typography variant="medium" type="secondary">
                    Chain ID:{' '}
                  </Typography>
                  <Typography variant="medium">{manifest?.chain?.chainId}</Typography>
                </div>
              )}
              {manifest?.rpcFamily && (
                <div className={styles.line}>
                  <Typography variant="medium" type="secondary">
                    Family:{' '}
                  </Typography>
                  <Typography variant="medium" style={{ textTransform: 'capitalize' }}>
                    {manifest?.rpcFamily?.join(' ')}
                  </Typography>
                </div>
              )}
              {manifest?.client?.name && (
                <div className={styles.line}>
                  <Typography variant="medium" type="secondary">
                    Client:{' '}
                  </Typography>
                  <Typography variant="medium">{manifest?.client?.name}</Typography>
                </div>
              )}
              {manifest?.nodeType && (
                <div className={styles.line}>
                  <Typography variant="medium" type="secondary">
                    Node type:{' '}
                  </Typography>
                  <Typography variant="medium" style={{ textTransform: 'capitalize' }}>
                    {manifest?.nodeType}
                  </Typography>
                </div>
              )}
            </div>
            <div style={{ height: 1, width: '100%', background: 'var(--sq-gray300)', margin: '16px 0' }}></div>
          </>
        )}
        <div className={styles.column}>
          <Typography variant="large" weight={600}>
            {t('projectOverview.deploymentDescription')}
          </Typography>
          <div style={{ width: 670, marginTop: 8 }}>
            <Expand>
              <Markdown.Preview>{deploymentDescription || 'N/A'}</Markdown.Preview>
            </Expand>
          </div>
        </div>
      </div>

      <div style={{ marginLeft: 48, flex: 7, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <NewCard
          style={{ width: '100%' }}
          titleExtra={
            <div style={{ display: 'flex', gap: 8, width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Typography>
                  <img src="/static/booster.svg" alt="" style={{ marginRight: 10, marginTop: 4 }}></img>
                  Boost
                </Typography>
                <div style={{ flex: 1, paddingLeft: 32 }}>
                  {BalanceLayout({
                    mainBalance: formatSQT(currentBooster),
                  })}
                </div>
              </div>
              <span style={{ flex: 1 }}></span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Typography>Total Boost Rewards over All Time</Typography>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex' }}>
                    {BalanceLayout({
                      mainBalance: formatSQT(accTotalRewards.current.toString()),
                    })}
                    <div style={{ paddingTop: 8, paddingLeft: 20 }}>
                      <Tag color="success">
                        + {formatNumber(formatSQT(estimatedPerEraRewards.estimatedTotalRewardsPerEra.toString()))} Per
                        era
                      </Tag>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        >
          <div className="col-flex" style={{ gap: 16 }}>
            <div className="flex" style={{ justifyContent: 'space-between' }}>
              <Typography variant="small" type="secondary">
                Booster Allocation Rewards
              </Typography>
              <Typography variant="small">
                {formatNumber(formatSQT(accTotalRewards.current.sub(accQueryRewards.current).toString() || '0'))}{' '}
                {TOKEN}
                (all time)
                <Tag color="success" style={{ marginLeft: 8 }}>
                  + {formatNumber(formatSQT(estimatedPerEraRewards.estimatedAllocatedPerEraRewards.toString()))} Per era{' '}
                  {TOKEN}
                </Tag>
              </Typography>
            </div>

            <div className="flex" style={{ justifyContent: 'space-between' }}>
              <Typography variant="small" type="secondary">
                Booster Query Rewards
              </Typography>
              <Typography variant="small">
                {formatNumber(formatSQT(accQueryRewards.current.toString() || '0'))} {TOKEN}
                (all time)
                <Tag color="success" style={{ marginLeft: 8 }}>
                  + {formatNumber(formatSQT(estimatedPerEraRewards.estimatedQueryRewardsPerEra.toString()))} Per era{' '}
                  {TOKEN}
                </Tag>
              </Typography>
            </div>
          </div>
        </NewCard>
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
                Total {project.type === ProjectType.RPC ? 'RPC Providers' : 'Indexers'}
              </Typography>
              <Typography variant="small">
                {project.deployments.nodes.find((i) => i?.id === deploymentId)?.indexers.totalCount || 0}
              </Typography>
            </div>

            <div className="flex" style={{ justifyContent: 'space-between' }}>
              <Typography variant="small" type="secondary">
                Total Active Agreements
              </Typography>
              <Typography variant="small">
                {project.deployments.nodes.find((i) => i?.id === deploymentId)?.serviceAgreementsActive.totalCount || 0}
              </Typography>
            </div>

            <div className="flex" style={{ justifyContent: 'space-between' }}>
              <Typography variant="small" type="secondary">
                Total Agreements over all time
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
