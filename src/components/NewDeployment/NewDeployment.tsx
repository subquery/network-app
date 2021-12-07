// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Field, Form, Formik } from 'formik';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { NewDeployment as NewDeploymentParams, newDeploymentSchema } from '../../models';
import Button from '../Button';
import { ModalContainer } from '../NewProject/NewProject';
import styles from './NewDeployment.module.css';

type Props = {
  onSubmit: (deployment: NewDeploymentParams) => Promise<void> | void;
  onClose?: () => void;
};

const NewDeployment: React.FC<Props> = (props) => {
  const { t } = useTranslation('translation');

  return (
    <ModalContainer title={t('deployment.create.title')} onClose={props.onClose}>
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
              <label htmlFor="deploymentId">{t('deployment.create.deploymentId')}</label>
              <Field name="deploymentId" />
              <label htmlFor="description">{t('deployment.create.description')}</label>
              <Field name="description" as="textarea" />
              {/*<p>{t('deployment.create.explainer')}</p>*/}
              {/*<p>{JSON.stringify(errors)}</p>*/}
            </div>
            <Button
              onClick={submitForm}
              type="secondary"
              label={t('deployment.create.submit')}
              disabled={isSubmitting}
              className={styles.submit}
            />
          </Form>
        )}
      </Formik>
    </ModalContainer>
  );
};

export default NewDeployment;
