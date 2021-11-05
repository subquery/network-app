// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Field, Form, Formik } from 'formik';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { NewDeployment as NewDeploymentParams, newDeploymentSchema } from '../../models';
import Button from '../Button';
import styles from './NewDeployment.module.css';

type Props = {
  onSubmit: (deployment: NewDeploymentParams) => Promise<void> | void;
};

const NewDeployment: React.FC<Props> = (props) => {
  const { t } = useTranslation('translation');

  return (
    <div className={styles.card}>
      <h3>{t('deployment.create.title')}</h3>
      <Formik
        initialValues={{
          version: '0.0.1', // TODO use current version
          description: '',
          deploymentId: '',
        }}
        validationSchema={newDeploymentSchema.shape({})}
        onSubmit={props.onSubmit}
      >
        {({ isSubmitting, submitForm, errors }) => (
          <Form>
            <div className={styles.form}>
              <label htmlFor="version">{t('deployment.create.version')}</label>
              <Field name="version" />
              <label htmlFor="description">{t('deployment.create.description')}</label>
              <Field name="description" />
              <label htmlFor="deploymentId">{t('deployment.create.deploymentId')}</label>
              <Field name="deploymentId" />
              <p>{t('deployment.create.explainer')}</p>
              {<p>{JSON.stringify(errors)}</p>}
              <div className={styles.submit}>
                <Button
                  onClick={submitForm}
                  type="primary"
                  label={t('deployment.create.submit')}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default NewDeployment;
