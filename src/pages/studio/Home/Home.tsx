// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import Modal from 'react-modal';
import { useNavigate } from 'react-router';
import { Button } from '@subql/components';
import { ProjectFieldsFragment } from '@subql/network-query';
import { useGetProjectsLazyQuery } from '@subql/react-hooks';
import { useInfiniteScroll } from 'ahooks';

import { CreateInstructions, NewProject, ProjectCard, Spinner } from '../../../components';
import { useWeb3 } from '../../../containers';
import { useProject } from '../../../hooks';
import { modalStyles, notEmpty, renderAsync } from '../../../utils';
import { ROUTES } from '../../../utils';
import { Header } from '../../explorer/Home/Home';
import styles from './Home.module.css';
const { STUDIO_CREATE_NAV, STUDIO_PROJECT_NAV } = ROUTES;

const Project: React.FC<{
  projectId: string;
  account: string;
  onClick?: () => void;
  projectDetails: ProjectFieldsFragment;
}> = ({ projectId, account, onClick, projectDetails }) => {
  const asyncProject = useProject(projectId);

  return (
    <div className={styles.card}>
      {renderAsync(asyncProject, {
        error: (e) => {
          console.log('ERROR loading project', e);
          return <span>{`Failed to load project: ${e.message}`}</span>;
        },
        loading: () => {
          return (
            <ProjectCard
              onClick={onClick}
              project={{
                ...projectDetails,
                metadata: undefined,
                id: projectId,
                owner: account,
              }}
            />
          );
          // return <span>{`Loading project id: ${projectId}`}</span>
        },
        data: (project) => {
          if (!project) return null;
          return (
            <ProjectCard
              project={{
                ...projectDetails,
                ...project,
              }}
              onClick={onClick}
            />
          );
        },
      })}
    </div>
  );
};

const Home: React.FC = () => {
  const { account } = useWeb3();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = React.useState<boolean>(false);
  const [getProjects, asyncProjects] = useGetProjectsLazyQuery({
    variables: { offset: 0 },
  });

  const [projects, setProjects] = React.useState<ProjectFieldsFragment[]>([]);

  const loadMore = async () => {
    const res = await getProjects({
      variables: {
        offset: projects.length,
      },
    });

    if (res.data?.projects?.nodes) {
      setProjects([...projects, ...res.data.projects?.nodes.filter(notEmpty)]);
    }

    return {
      list: [],
      isNoMore: !res.error && !res.data?.projects?.nodes.length,
    };
  };

  const handleCreateProject = (name: string) => {
    navigate(`${STUDIO_CREATE_NAV}?name=${encodeURI(name)}`);
  };

  const enableCreateModal = () => setShowCreateModal(true);

  useInfiniteScroll(() => loadMore(), {
    target: document,
    isNoMore: (d) => !!d?.isNoMore,
    threshold: 300,
  });

  return (
    <div className="content-width">
      <div className="col-flex" style={{ marginBottom: 24 }}>
        <Header />
        <div className="flex" style={{ justifyContent: 'center' }}>
          <Button type="primary" label="Create a project" onClick={enableCreateModal} />
        </div>
      </div>

      <Modal
        isOpen={showCreateModal}
        style={modalStyles}
        onRequestClose={() => setShowCreateModal(false)}
        closeTimeoutMS={200}
      >
        <NewProject onSubmit={handleCreateProject} onClose={() => setShowCreateModal(false)} />
      </Modal>

      {renderAsync(asyncProjects, {
        loading: () => <Spinner />,
        error: (error) => <p>{`Failed to load projects: ${error.message}`}</p>,
        data: (_projects) => {
          if (!projects?.length) {
            return <CreateInstructions onClick={enableCreateModal} />;
          }

          const renderProjects = projects.filter(({ id, owner }) => account && id && owner === account);

          return (
            <div className={styles.list}>
              {renderProjects.map((proj) => (
                <Project
                  projectId={proj.id}
                  key={proj.id}
                  onClick={() => navigate(`${STUDIO_PROJECT_NAV}/${proj.id}`)}
                  account={account ?? ''}
                  projectDetails={proj}
                />
              ))}
            </div>
          );
        },
      })}
    </div>
  );
};

export default Home;
