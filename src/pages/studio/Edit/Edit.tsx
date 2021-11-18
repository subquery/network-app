// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useHistory, useParams } from 'react-router';
import { ProjectEdit } from '../../../components';
import { useProject, useUpdateProjectMetadata } from '../../../hooks';
import { FormProjectMetadata } from '../../../models';
import { renderAsync } from '../../../utils';

const Edit: React.VFC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();

  const asyncProject = useProject(id);
  const updateMetadata = useUpdateProjectMetadata(id);

  const handleSubmit = async (metadata: FormProjectMetadata) => {
    await updateMetadata(metadata);

    history.push(`/studio/project/${id}`);
  };

  return renderAsync(asyncProject, {
    error: (e) => <span>{`Error: ${e.message}`}</span>,
    loading: () => <span>Loading....</span>,
    data: (project) => {
      if (!project) return null;

      return (
        <div>
          <ProjectEdit project={project} onSubmit={handleSubmit} />
        </div>
      );
    },
  });
};

export default Edit;
