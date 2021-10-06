// Copyright 2020-2021 OnFinality Limited authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Field } from 'formik';
import * as React from 'react';
import styles from './ImageInput.module.css';
import IPFSImage from './IPFSImage';

type Props = {
  label: string;
  value: string | File | undefined;
  onChange: (file: File) => void;
};

const ImageInput: React.FC<Props> = ({ label, value, onChange }) => {
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
      {value ? <IPFSImage src={value} className={styles.content} alt={alt} /> : label}
    </label>
  );
};

export default ImageInput;
