// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Manifest } from '@hooks/useGetDeploymentManifest';
import { Address, Typography } from '@subql/components';
import { ProjectFieldsFragment, ProjectType } from '@subql/network-query';
import { formatSQT } from '@subql/react-hooks';
import { formatNumber, ROUTES, TOKEN } from '@utils';
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import { toSvg } from 'jdenticon';

import { ETH_TYPE_DICTION, NETWORK_TYPE_DICTION } from 'src/const/const';
import { ProjectMetadata } from 'src/models';

import IPFSImage from '../IPFSImage';
import styles from './ProjectCard.module.css';

type Props = {
  project: { metadata: ProjectMetadata | undefined } & Omit<ProjectFieldsFragment, 'metadata'> & {
      manifest?: Manifest;
    };
  onClick?: () => void;
  href?: string;
};

const { PROJECT_NAV } = ROUTES;
const MAX_NETWORK_NAME_LENGTH = 28;
const MAX_CHAIN_ID_LENGTH = 18;

const ProjectCard: React.FC<Props> = ({ project, href, onClick }) => {
  const ipfsImage = React.useMemo(() => {
    if (!project.metadata) {
      return '';
    }

    if (!project.metadata.image)
      return `data:image/svg+xml;utf8,${encodeURIComponent(toSvg(project.metadata.name, 500))}`;

    return project.metadata.image;
  }, [project.metadata]);

  const booster = React.useMemo(() => {
    return project?.deployments?.nodes.reduce(
      (cur, add) =>
        cur.plus(
          BigNumber(add?.deploymentBoosterSummaries?.groupedAggregates?.[0]?.sum?.totalAmount.toString() || '0'),
        ),
      BigNumber(0),
    );
  }, [project?.deployments?.nodes]);

  const networkVal = React.useMemo(() => {
    if (project.type === ProjectType.RPC && project.manifest?.rpcFamily) {
      return project.manifest.rpcFamily[0];
    }

    const chainId =
      project.type === ProjectType.SUBQUERY
        ? project.manifest?.network?.chainId
        : project.manifest?.dataSources?.[0]?.network;
    if (!chainId) return '-';

    const polkadotName = NETWORK_TYPE_DICTION[chainId];
    const ethName = ETH_TYPE_DICTION[chainId];

    return polkadotName || ethName || `Chain ID ${chainId}`;
  }, [project.type, project.manifest]);

  const isChainIdFallback = React.useMemo(() => {
    return `${networkVal || '-'}`.startsWith('Chain ID ');
  }, [networkVal]);

  const chainIdDisplayVal = React.useMemo(() => {
    if (!isChainIdFallback) return '';
    const val = `${networkVal || '-'}`.replace('Chain ID ', '');
    return val.length > MAX_CHAIN_ID_LENGTH ? `${val.slice(0, MAX_CHAIN_ID_LENGTH)}...` : val;
  }, [isChainIdFallback, networkVal]);

  const networkDisplayVal = React.useMemo(() => {
    const val = `${networkVal || '-'}`;
    return val.length > MAX_NETWORK_NAME_LENGTH ? `${val.slice(0, MAX_NETWORK_NAME_LENGTH)}...` : val;
  }, [networkVal]);

  return (
    <a
      href={href ? href : `${PROJECT_NAV}/${project.id}`}
      className={styles.card}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <IPFSImage
        src={ipfsImage}
        className={styles.image}
        renderPlaceholder={() => <div style={{ width: '100%', height: '205px', background: '#fff' }}></div>}
      />
      <div style={{ flex: 1 }}>
        <Typography
          className="overflowEllipsis2"
          style={{ marginTop: 16, marginBottom: 6, height: 48, wordBreak: 'break-word' }}
          weight={600}
        >
          {project.metadata?.name || project.id}
        </Typography>
      </div>

      {project.type === ProjectType.SUBQUERY || project.type === ProjectType.SUBGRAPH ? (
        <div className="flex">
          {isChainIdFallback ? (
            <>
              <Typography variant="small" type="secondary">
                Chain ID
              </Typography>
              <Typography variant="small" style={{ marginLeft: 6 }}>
                {chainIdDisplayVal}
              </Typography>
            </>
          ) : (
            <Typography variant="small">{networkDisplayVal}</Typography>
          )}
        </div>
      ) : (
        <Typography variant="small" style={{ textTransform: 'uppercase' }}>
          {project.manifest?.rpcFamily?.[0]}
          {project.manifest?.rpcFamily?.[0] && project.manifest?.nodeType && ' - '}
          <span style={{ textTransform: 'capitalize' }}>{project.manifest?.nodeType}</span>
        </Typography>
      )}

      <div className={styles.line}></div>
      <div className="flex" style={{ marginBottom: 12 }}>
        <div className="flex">
          <Typography variant="small">
            {project?.deployments?.nodes.reduce((cur, add) => cur + (add?.indexers.totalCount || 0), 0)}
          </Typography>
          <Typography variant="small" type="secondary" style={{ marginLeft: 5 }}>
            Operator
          </Typography>
        </div>
        <span style={{ flex: 1 }}></span>
        <div className="flex">
          <Typography variant="small">
            {formatNumber(formatSQT(booster.toString()))} {TOKEN}
          </Typography>
          <Typography variant="small" type="secondary" style={{ marginLeft: 5 }}>
            Boost
          </Typography>
        </div>
      </div>
      {project.updatedTimestamp && (
        <div className="flex">
          <Typography variant="small" type="secondary">
            Last updated
          </Typography>
          <Typography variant="small" style={{ marginLeft: 8 }}>
            {dayjs(project.updatedTimestamp).utc(true).fromNow()}
          </Typography>
        </div>
      )}
    </a>
  );
};

export default ProjectCard;
