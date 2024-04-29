// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { gql, useQuery } from '@apollo/client';
import { IPFSImage } from '@components';
import { useProjectMetadata } from '@containers';
import { SubqlCard, Typography } from '@subql/components';
import { renderAsync } from '@subql/react-hooks';
import { filterSuccessPromoiseSettledResult, notEmpty } from '@utils';
import { Button, Skeleton } from 'antd';

import { ProjectMetadata } from 'src/models';

import styles from './ActiveCard.module.less';

export const ActiveCard = () => {
  const navigate = useNavigate();
  const { getMetadataFromCid } = useProjectMetadata();

  const projectsQuery = useQuery<{ projects: { totalCount: number; nodes: { id: string; metadata: string }[] } }>(gql`
    query GetProjects(
      $offset: Int
      $type: [ProjectType!] = [SUBQUERY, RPC]
      $orderBy: [ProjectsOrderBy!] = [TOTAL_REWARD_DESC, UPDATED_TIMESTAMP_DESC]
    ) {
      projects(first: 30, offset: $offset, orderBy: $orderBy, filter: { type: { in: $type } }) {
        totalCount
        nodes {
          id
          metadata
        }
      }
    }
  `);

  const [projectsMetadata, setProjectsMetadata] = useState<ProjectMetadata[]>([]);

  const getAllProjectMetadata = async () => {
    if (!projectsQuery.loading && projectsQuery.data?.projects?.nodes.slice(0, 50)) {
      const res = await Promise.allSettled(
        projectsQuery.data?.projects?.nodes
          .slice(0, 50)
          .filter(notEmpty)
          .map((i) => getMetadataFromCid(i.metadata)),
      );

      setProjectsMetadata(res.filter(filterSuccessPromoiseSettledResult).map((i) => i.value));
    }
  };

  useEffect(() => {
    getAllProjectMetadata();
  }, [projectsQuery]);

  return (
    <>
      {renderAsync(projectsQuery, {
        loading: () => (
          <Skeleton
            avatar
            active
            style={{ display: 'flex', maxHeight: 176, marginTop: 24, marginBottom: 40 }}
            paragraph={{ rows: 4 }}
          ></Skeleton>
        ),
        error: (e) => (
          <Skeleton
            avatar
            active
            style={{ display: 'flex', maxHeight: 176, marginTop: 24, marginBottom: 40 }}
            paragraph={{ rows: 4 }}
          ></Skeleton>
        ),
        data: (projects) => {
          return (
            <SubqlCard
              title={
                <div className="col-flex" style={{ position: 'relative', width: '100%' }}>
                  <Typography variant="h5" weight={500} style={{ whiteSpace: 'pre-wrap' }}>
                    Decentralised RPCs and Indexed Datasets
                  </Typography>
                  <Typography type="secondary" style={{ whiteSpace: 'pre-wrap' }}>
                    Access decentralised data from across web3 in only a few minutes from any of our{' '}
                    {projects.projects?.totalCount} projects
                  </Typography>
                  <div className={styles.images}>
                    {projects.projects?.nodes.filter(notEmpty).map((project, index) => (
                      <IPFSImage
                        key={project.id}
                        src={projectsMetadata[index]?.image || '/static/default.project.png'}
                        className={styles.image}
                        onClick={() => {
                          navigate(`/explorer/project/${project.id}`);
                        }}
                      />
                    ))}
                  </div>

                  <div className="flex-center">
                    <Button
                      className={styles.explorerButton}
                      shape="round"
                      size="large"
                      type="primary"
                      onClick={() => {
                        navigate(`/explorer`);
                      }}
                    >
                      View Projects
                    </Button>
                  </div>
                </div>
              }
              style={{ marginTop: 24, marginBottom: 40, width: '100%' }}
            ></SubqlCard>
          );
        },
      })}
    </>
  );
};
