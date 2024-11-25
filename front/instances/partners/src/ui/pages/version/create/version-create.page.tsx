import React from 'react';

import { DTO2FormComponent } from '@fc/dto2form';

import { useVersionCreate } from '../../../../hooks';

export const VersionCreatePage = React.memo(() => {
  const { schema, submitHandler } = useVersionCreate();

  return (
    <div className="fr-col-12 fr-col-md-8 fc-grey-border--full">
      <div className="fr-col-offset-1 fr-col-10">
        <h1>Create</h1>
        <DTO2FormComponent
          config={{ id: 'DTO2Form.version.create' }}
          initialValues={{}}
          schema={schema}
          onSubmit={submitHandler}
        />
      </div>
    </div>
  );
});

VersionCreatePage.displayName = 'VersionCreatePage';
