// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { IPFSImage } from '@components';
import NewCard from '@components/NewCard';
import { useProjectMetadata } from '@containers';
import { Typography } from '@subql/components';
import { renderAsync, useGetProjectsQuery } from '@subql/react-hooks';
import { filterSuccessPromoiseSettledResult, notEmpty, parseError } from '@utils';
import { Skeleton } from 'antd';
import Link from 'antd/es/typography/Link';

import { ProjectMetadata } from 'src/models';

import styles from './ActiveCard.module.less';

export const ActiveCard = () => {
  const navigate = useNavigate();
  const { getMetadataFromCid } = useProjectMetadata();

  const projectsQuery = useGetProjectsQuery({
    variables: {
      offset: 0,
    },
  });

  const [projectsMetadata, setProjectsMetadata] = useState<ProjectMetadata[]>([]);

  const getAllProjectMetadata = async () => {
    if (!projectsQuery.loading && projectsQuery.data?.projects?.nodes) {
      const res = await Promise.allSettled(
        projectsQuery.data?.projects?.nodes.filter(notEmpty).map((i) => getMetadataFromCid(i.metadata)),
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
        loading: () => <Skeleton active style={{ marginTop: 30 }}></Skeleton>,
        error: (e) => <>{parseError(e)}</>,
        data: (projects) => {
          return (
            <NewCard
              title="Active Projects"
              titleExtra={
                <div style={{ fontSize: 16, display: 'flex', alignItems: 'baseline' }}>
                  <Typography variant="h5" weight={500} style={{ color: 'var(--sq-blue600)', marginRight: 8 }}>
                    {projects.projects?.totalCount}
                  </Typography>
                  Project
                </div>
              }
              tooltip="The number of actively indexed projects across the entire network"
              width={302}
              style={{ marginTop: 24 }}
            >
              <>
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
                <div>
                  <Link
                    onClick={() => {
                      navigate('/explorer/home');
                    }}
                  >
                    View All Projects
                  </Link>
                </div>
              </>
            </NewCard>
          );
        },
      })}
    </>
  );
};
