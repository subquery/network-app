// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0
import React, { useEffect, useRef } from 'react';
import { TextInput, Typography } from '@subql/components';
import { useField } from 'formik';

import styles from './FTextInput.module.less';

const FTextInput: React.FC<
  Omit<React.ComponentProps<typeof TextInput>, 'error' | 'value' | 'onChange'> & { id: string }
> = ({ id, ...rest }) => {
  const [field, meta] = useField(id);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (meta.touched && meta.error) {
      ref.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
    }
  }, [meta.touched, meta.error]);

  return (
    <div className="col-flex" ref={ref} style={{ gap: 8 }}>
      <TextInput
        containerClassName={styles.textInput}
        {...field}
        {...(rest as any)}
        name={id}
        error={!!(meta.touched && meta.error)}
      />

      {meta.touched && meta.error && <Typography type="danger">{meta.touched && meta.error}</Typography>}
    </div>
  );
};

export default FTextInput;
