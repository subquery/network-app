// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Field } from 'formik';

import IPFSImage from '../IPFSImage';
import styles from './ImageInput.module.css';

type Props = {
  label: string;
  value: string | File | undefined;
  onChange: (file: File) => void;
  imageClassName?: string;
  placeholder: string;
  editText?: string;
};

const ImageInput: React.FC<Props> = ({ label, value, placeholder, editText, imageClassName, onChange }) => {
  const alt = React.useMemo(() => (value ? (typeof value === 'string' ? value : value.name) : undefined), [value]);

  return (
    <label htmlFor={label} className={styles.label}>
      <Field
        id={label}
        name={label}
        type="file"
        accept="image/*"
        onChange={(event: React.FormEvent<HTMLInputElement>) => {
          if (event.currentTarget.files?.[0]) {
            onChange(event.currentTarget.files?.[0]);
          }
        }}
      />
      <div className={[styles.imagePlaceholder, imageClassName].join(' ')}>
        {value ? (
          <IPFSImage src={value} className={[styles.content, imageClassName].join(' ')} alt={alt} />
        ) : (
          <img src={placeholder} alt="placeholder" className={styles.content} />
        )}
        <div className={styles.imageOverlay}>
          <i className="bi-camera" role="img" aria-label="camera" />
          <p>{editText ?? label}</p>
        </div>
      </div>
    </label>
  );
};

export default ImageInput;
