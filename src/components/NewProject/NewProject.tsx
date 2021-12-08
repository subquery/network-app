// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@subql/react-ui';
import styles from './NewProject.module.css';

type Props = {
  onSubmit: (name: string) => void;
  onClose?: () => void;
};

export const ModalContainer: React.FC<{ title: string; onClose?: () => void }> = ({ title, onClose, children }) => {
  return (
    <div className={styles.container}>
      <p className={styles.title}>{title}</p>
      {children}
      {onClose && <i className={['bi-x', styles.close].join(' ')} role="img" aria-label="x" onClick={onClose} />}
    </div>
  );
};

const NewProject: React.FC<Props> = ({ onSubmit, onClose }) => {
  const { t } = useTranslation();
  const [name, setName] = React.useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setName(e.target.value);
  };

  const handleSubmit = () => onSubmit(name);

  return (
    <ModalContainer title={t('newProjectModal.title')} onClose={onClose}>
      <p className={styles.subtitle}>{t('newProjectModal.subtitle')}</p>
      <input type="text" value={name} onChange={handleChange} placeholder={t('newProjectModal.placeholder')} />
      <Button type="secondary" label={t('newProjectModal.button')} onClick={handleSubmit} disabled={!name} />
    </ModalContainer>
  );
};

export default NewProject;
