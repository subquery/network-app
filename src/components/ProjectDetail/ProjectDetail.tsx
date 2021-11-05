// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import Modal from 'react-modal';
import { useCreateDeployment } from '../../hooks';
import { ProjectDetails, NewDeployment as NewDeploymentParams } from '../../models';
import { genesisHashToName } from '../../utils';
import Button from '../Button';
import Detail from '../Detail';
import NewDeployment from '../NewDeployment';
import styles from './ProjectDetail.module.css';

type Props = {
  project: ProjectDetails;
};

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '10px',
  },
};

const ProjectDetail: React.VFC<Props> = ({ project }) => {
  const network = React.useMemo(
    () => project.deployment && genesisHashToName(project.deployment.manifest.asV0_2_0.network.genesisHash),
    [project.deployment?.manifest],
  );

  const [deploymentModal, setDeploymentModal] = React.useState<boolean>(false);

  const createDeployment = useCreateDeployment(project.id);

  const handleSubmitCreate = async (details: NewDeploymentParams) => {
    await createDeployment(details);

    setDeploymentModal(false);
  };

  const renderNoDeployments = () => {
    return (
      <div>
        <div>
          <span>Deploy to SubQuery Network</span>
          <span>Something something something</span>
        </div>
        <Button label="Deploy" onClick={() => setDeploymentModal(true)} type="primary" />
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <Modal isOpen={deploymentModal} style={customStyles} onRequestClose={() => setDeploymentModal(false)}>
        <NewDeployment onSubmit={handleSubmitCreate} />
      </Modal>
      <div className={styles.column}>
        <div className={styles.left}>
          {/* TODO map*/}
          <Detail className={styles.leftDetail} label="Network" value={network} />
          <Detail className={styles.leftDetail} label="Network" value={network} />
        </div>

        <p className={styles.description}>{project.metadata.description}</p>
      </div>
      <div className={styles.column}>
        <Detail label="Website" value={project.metadata.websiteUrl || 'N/A'} href={project.metadata.websiteUrl} />
        {project.deployment ? (
          <>
            <Detail
              label="Source"
              value={project.deployment?.manifest.repository || 'N/A'}
              href={project.deployment?.manifest.repository}
            />
            <Detail
              label="Deployment"
              value={project.deployment.id}
              href={`https://ipfs.io/ipfs/${project.deployment.id}`}
            />
          </>
        ) : (
          renderNoDeployments()
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
