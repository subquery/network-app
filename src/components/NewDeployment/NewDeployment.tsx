// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Form, Formik } from 'formik';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { FTextInput } from '..';
import { NewDeployment as NewDeploymentParams, newDeploymentSchema } from '../../models';
import { Button } from '@subql/react-ui';
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
        {({ isSubmitting, submitForm }) => (
          <Form>
            <div>
              <FTextInput label={t('deployment.create.version')} id="version" />
              <FTextInput label={t('deployment.create.deploymentId')} id="deploymentId" />
              <FTextInput label={t('deployment.create.description')} id="description" base="textarea" />
            </div>
            <Button
              onClick={submitForm}
              type="secondary"
              label={t('deployment.create.submit')}
              loading={isSubmitting}
              className={styles.submit}
            />
          </Form>
        )}
      </Formik>
    </ModalContainer>
  );
};

export default NewDeployment;
