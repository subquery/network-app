// Copyright 2020-2022 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ComponentMeta, ComponentStory } from '@storybook/react';
import { Form, Formik } from 'formik';

import ImageInput from './ImageInput';

export default {
  title: 'ImageInput',
  component: ImageInput,
} as ComponentMeta<typeof ImageInput>;

const Template: ComponentStory<typeof ImageInput> = (args) => {
  return (
    <Formik
      initialValues={{
        image: undefined,
      }}
      onSubmit={() => {
        /* For testing*/
      }}
    >
      {({ setFieldValue, values }) => (
        <Form>
          <ImageInput {...args} onChange={(value) => setFieldValue('image', value)} value={values.image} />
        </Form>
      )}
    </Formik>
  );
};

export const Default = Template.bind({});

Default.args = {
  label: 'Upload image',
};
