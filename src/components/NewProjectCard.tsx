// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { useTranslation } from 'react-i18next';
import Button from './Button';
import styles from './ProjectCard.module.css';
import { Plus } from 'react-bootstrap-icons';

type Props = {
  onClick?: () => void;
};

const NewProjectCard: React.VFC<Props> = ({ onClick }) => {
  const { t } = useTranslation();

  return (
    <div className={[styles.card, styles.newCard].join(' ')} onClick={onClick}>
      <h2>{t('newProjectCard.title')}</h2>
      <Button type="primary" label={t('newProjectCard.button')} leftItem={<Plus size={25} />} />
    </div>
  );
};

export default NewProjectCard;
