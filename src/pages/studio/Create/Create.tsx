// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Formik, Form, Field } from 'formik';
import { useIPFS, useProjectMetadata, useQueryRegistry } from '../../../containers';
import { useTranslation } from 'react-i18next';
import { ProjectMetadata, projectMetadataSchema } from '../../../models';
import { Button, ImageInput } from '../../../components';
import { useHistory } from 'react-router';
import styles from './Create.module.css';

const Create: React.VFC = () => {
  const { t } = useTranslation('translation');

  const { uploadMetadata } = useProjectMetadata();
  const { ipfs } = useIPFS();
  const { registerQuery } = useQueryRegistry();
  const history = useHistory();

  const createProject = React.useCallback(
    async (project: ProjectMetadata & { image: File | undefined | string }) => {
      // Form can give us a File type that doesn't match the schema
      if ((project.image as unknown) instanceof File) {
        console.log('Uploading icon...');
        const res = await ipfs.add(project.image as unknown as File);
        project.image = res.cid.toString();
        console.log('Uploading icon...DONE');
      }

      const cid = await uploadMetadata(project);

      console.log('Uploaded metadata to IPFS', cid);

      const tx = await registerQuery(cid);

      console.log('TX submitted, awaiting confirmation');

      const receipt = await tx.wait(1);

      console.log('TX confirmed');

      const event = receipt.events?.[0];

      if (event) {
        const { queryId, creator } = event.args as any;

        console.log(`Query created. queryId=${queryId.toString()} creator=${creator}`);
        history.push(`/studio/project/${queryId.toString()}`);
      }
    },
    [ipfs, uploadMetadata, registerQuery, history],
  );

  return (
    <div>
      <Formik
        initialValues={{
          name: '',
          subtitle: '',
          description: '',
          websiteUrl: undefined,
          image: undefined,
        }}
        validationSchema={projectMetadataSchema.shape({})}
        onSubmit={createProject}
      >
        {({ errors, touched, setFieldValue, values, isSubmitting, submitForm }) => (
          <Form>
            <div className={styles.form}>
              <label htmlFor="name">{t('studio.create.name')}</label>
              <Field name="name" />
              {errors.name && touched.name && <div>{errors.name}</div>}
              <ImageInput
                label={t('studio.create.image')}
                value={values.image}
                onChange={(value) => setFieldValue('image', value)}
              />
              <label htmlFor="subtitle">{t('studio.create.subtitle')}</label>
              <Field name="subtitle" />
              <label htmlFor="description">{t('studio.create.description')}</label>
              <Field name="description" as="textarea" />
              <label htmlFor="websiteUrl">{t('studio.create.websiteUrl')}</label>
              <Field name="websiteUrl" />
              <div className={styles.submit}>
                <Button onClick={submitForm} type="primary" label="Save" disabled={isSubmitting} />
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Create;
