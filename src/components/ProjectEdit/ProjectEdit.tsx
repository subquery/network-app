// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Form, Formik } from 'formik';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { FTextInput } from '..';
import { FormProjectMetadata, projectMetadataSchema, ProjectWithMetadata } from '../../models';
import { Button, Typography } from '@subql/components';
import ImageInput from '../ImageInput';
import styles from './ProjectEdit.module.css';
import { isEthError } from '../../utils';

type Props = {
  project: Required<ProjectWithMetadata>;
  onSubmit: (metadata: FormProjectMetadata) => void | Promise<void>;
  onCancel?: () => void;
};

const ProjectEdit: React.FC<Props> = (props) => {
  const { t } = useTranslation('translation');
  const [submitError, setSubmitError] = React.useState<string>();

  const handleSubmit = async (metadata: FormProjectMetadata) => {
    try {
      await props.onSubmit(metadata);
    } catch (e) {
      if (isEthError(e) && e.code === 4001) {
        setSubmitError(t('errors.transactionRejected'));
        return;
      }
      setSubmitError((e as Error).message);
    }
  };

  return (
    <div>
      <Formik
        initialValues={props.project.metadata}
        validationSchema={projectMetadataSchema.shape({})}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, submitForm, setFieldValue, values }) => (
          <Form>
            <div className={styles.form}>
              <div className={styles.fields}>
                <FTextInput label={t('studio.create.name')} id="name" />
                <FTextInput label={t('studio.create.description')} id="description" base="textarea" />
                <FTextInput label={t('studio.create.websiteUrl')} id="websiteUrl" />
                <FTextInput label={t('studio.create.codeUrl')} id="codeUrl" />
                {submitError && <Typography className={styles.error}>{submitError}</Typography>}
              </div>
              <div className={styles.image}>
                <ImageInput
                  label={t('studio.create.image')}
                  value={values.image}
                  onChange={(value) => setFieldValue('image', value)}
                  placeholder="/static/default.project.png"
                />
              </div>
            </div>
            <div /*className={styles.submit}*/>
              {props.onCancel && (
                <Button
                  onClick={props.onCancel}
                  type="secondary"
                  label={t('edit.cancelButton')}
                  disabled={isSubmitting}
                  className={styles.submit}
                />
              )}
              <Button
                onClick={submitForm}
                type="primary"
                label={t('edit.submitButton')}
                loading={isSubmitting}
                className={styles.cancel}
              />
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ProjectEdit;
