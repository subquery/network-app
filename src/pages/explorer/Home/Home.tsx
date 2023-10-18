// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { SearchOutlined } from '@ant-design/icons';
import { Typography } from '@subql/components';
import { ProjectFieldsFragment as Project, ProjectUpdateFieldFragment } from '@subql/network-query';
import { useGetProjectsAllLazyQuery, useGetProjectsLazyQuery } from '@subql/react-hooks';
import { makeCacheKey } from '@utils/limitation';
import { useInfiniteScroll } from 'ahooks';
import { Input } from 'antd';
import BigNumber from 'bignumber.js';
import localforage from 'localforage';

import { ProjectCard, Spinner } from '../../../components';
import { useProjectMetadata } from '../../../containers';
import { useAsyncMemo } from '../../../hooks';
import { notEmpty } from '../../../utils';
import { ROUTES } from '../../../utils';
import styles from './Home.module.css';

const { PROJECT_NAV } = ROUTES;

const ProjectItem: React.FC<{ project: Project; onClick?: () => void }> = ({ project, onClick }) => {
  const { getMetadataFromCid } = useProjectMetadata();

  const { data: metadata } = useAsyncMemo(() => getMetadataFromCid(project.metadata), [project]);

  return (
    <div className={styles.card}>
      <ProjectCard
        onClick={onClick}
        project={{
          ...project,
          metadata,
        }}
      />
    </div>
  );
};

// TODO move to components
export const Header: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className={styles.header}>
      <Typography variant="h3">{t('explorer.home.header')}</Typography>
      <Typography style={{ width: 439, textAlign: 'center', marginTop: 16 }} type="secondary">
        {t('explorer.home.headerDesc')}
      </Typography>
    </div>
  );
};

const sortProjects = (projects: Project[]) => {
  return (
    projects
      .map((proj) => ({
        ...proj,
        amount: proj.deployments.nodes.reduce((cur, add) => {
          const lockedAmount = BigNumber(add?.serviceAgreements?.aggregates?.sum?.lockedAmount.toString() || '0');
          return cur.plus(lockedAmount);
        }, BigNumber('0')),
      }))
      // For kepler network project, top it.
      // don't care in testnet
      .map((proj) => {
        return {
          ...proj,
          amount: proj.id === '0x06' ? BigNumber('Infinity') : proj.amount,
        };
      })
      .sort((a, b) => (a.amount.gt(b.amount) ? -1 : 1))
  );
};

const useCachedProjects = () => {
  const cacheKey = React.useRef(makeCacheKey('projects'));

  const getCachedProjects: () => Promise<Project[]> = async () => {
    try {
      const result = await localforage.getItem<Project[]>(cacheKey.current);
      return result || [];
    } catch {
      return [];
    }
  };

  const setCachedProjectgs = async (
    data: (ProjectUpdateFieldFragment | Project)[],
    mode: 'merge' | 'update' = 'merge',
  ) => {
    try {
      const old = await getCachedProjects();

      // for merge mode, suppose the data is Project[]
      if (mode === 'merge') {
        return await localforage.setItem(cacheKey.current, sortProjects([...old, ...(data as Project[])]));
      } else if (mode === 'update') {
        const newData = old.map((item) => {
          return {
            ...item,
            ...data.find((i) => i.id === item.id),
          };
        });
        return await localforage.setItem(cacheKey.current, sortProjects(newData));
      }
    } catch (e) {
      console.error('Set Cached failed');
      console.error(e);
    }
  };

  return {
    getCachedProjects,
    setCachedProjectgs,
  };
};

const Home: React.FC = () => {
  const [getProjects, { error, loading }] = useGetProjectsLazyQuery({
    variables: { offset: 0 },
  });

  const [getSpecFiledOfProjects, { error: updateError, loading: updateLoading }] = useGetProjectsAllLazyQuery();

  const navigate = useNavigate();
  const times = React.useRef(0);
  const { getCachedProjects, setCachedProjectgs } = useCachedProjects();

  const [projects, setProjects] = React.useState<Project[]>([]);

  const loadMore = async () => {
    // there have a flow:
    //   1. Load cache, when first time call this function
    //   2. If there have cached data, then request a update request for exist data and update it then set to Projects.
    //   3. When the second times or not have cached data, getProject with variable that not in cached data.
    if (times.current === 0) {
      let cachedProjects = await getCachedProjects();
      times.current = 1;
      if (cachedProjects.length) {
        const updatedData = await getSpecFiledOfProjects();
        cachedProjects =
          (await setCachedProjectgs(updatedData.data?.projects?.nodes.filter(notEmpty) || [], 'update')) || [];
      }
      setProjects(cachedProjects);

      return {
        list: [],
        isNoMore: false,
      };
    }

    const res = await getProjects({
      variables: {
        offset: 0,
        ids: projects.map((i) => i.id),
      },
    });
    // implement a sorting for projects
    if (res.data?.projects?.nodes) {
      const nonEmptyProjects = res.data.projects?.nodes.filter(notEmpty);
      // be care of this part, do not set cached data when non-first fetch.
      // the flow will be break & pages will show flush and confuse to user.
      await setCachedProjectgs(nonEmptyProjects);
      const sorted = sortProjects(nonEmptyProjects);
      setProjects([...projects, ...sorted]);
    }

    return {
      list: [],
      isNoMore: !res.error && !res.data?.projects?.nodes.length,
    };
  };

  useInfiniteScroll(() => loadMore(), {
    target: document,
    isNoMore: (d) => !!d?.isNoMore,
    threshold: 300,
  });

  return (
    <div className={styles.explorer}>
      <Header />
      {(error || updateError) && <span>{`We have an error: ${updateError?.message || error?.message}`}</span>}
      {/* TODO: finish this part */}
      {/* <div style={{ display: 'flex', marginBottom: 32 }}>
        <span style={{ flex: 1 }}></span>
        <Input
          style={{ width: 200, height: 48, padding: 12 }}
          prefix={<SearchOutlined style={{ color: 'var(--sq-gray500)' }} />}
          placeholder="Search"
          onKeyUp={(e) => {
            if (e.key.toUpperCase() === 'ENTER') {
              console.warn('search');
            }
          }}
        ></Input>
      </div> */}
      <div className={styles.list}>
        {projects?.length
          ? projects.map((project) => (
              <ProjectItem
                project={project}
                key={project.id}
                onClick={() => navigate(`${PROJECT_NAV}/${project.id}`)}
              />
            ))
          : ''}
      </div>
      {(loading || updateLoading) && <Spinner />}
    </div>
  );
};

export default Home;
