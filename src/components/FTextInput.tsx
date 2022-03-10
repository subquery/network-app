// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { TextInput } from '@subql/react-ui';
import { useField } from 'formik';

const FTextInput: React.FC<
  Omit<React.ComponentProps<typeof TextInput>, 'error' | 'value' | 'onChange'> & { id: string }
> = ({ id, ...rest }) => {
  const [field, meta] = useField(id);

  return <TextInput {...field} {...(rest as any)} name={id} error={meta.touched && meta.error} />;
};

export default FTextInput;
