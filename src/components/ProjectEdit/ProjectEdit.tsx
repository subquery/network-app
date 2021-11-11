// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Field, Form, Formik } from 'formik';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ProjectMetadata, projectMetadataSchema, ProjectWithMetadata } from '../../models';
import Button from '../Button';

type Props = {
  project: Required<ProjectWithMetadata>;
  onSubmit: (metadata: ProjectMetadata & { image: File | undefined | string }) => void | Promise<void>;
};

const ProjectEdit: React.VFC<Props> = (props) => {
  const { t } = useTranslation('translation');

  const handleSubmit = async (metadata: ProjectMetadata & { image: File | undefined | string }) => {
    await props.onSubmit(metadata);
  };

  return (
    <div>
      <Formik
        initialValues={props.project.metadata}
        validationSchema={projectMetadataSchema.shape({})}
        onSubmit={handleSubmit}
      >
        {({ errors, isSubmitting, submitForm }) => (
          <Form>
            <div>
              <label htmlFor="description">{t('studio.create.description')}</label>
              <Field name="description" as="textarea" />
              <label htmlFor="websiteUrl">{t('studio.create.websiteUrl')}</label>
              <Field name="websiteUrl" />
              <label htmlFor="codeUrl">{t('studio.create.codeUrl')}</label>
              <Field name="codeUrl" />
              {<p>{JSON.stringify(errors)}</p>}
              <div /*className={styles.submit}*/>
                <Button onClick={submitForm} type="primary" label="Save" disabled={isSubmitting} />
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ProjectEdit;
