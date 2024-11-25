import { render } from '@testing-library/react';

import { t } from '@fc/i18n';

import { FormRequiredMessageComponent } from './form-required.component';

describe('FormRequiredMessageComponent', () => {
  it('should match the snapshot', () => {
    // when
    const { container } = render(<FormRequiredMessageComponent />);

    // then
    expect(container).toMatchSnapshot();
    expect(t).toHaveBeenCalledWith('Form.message.requiredFields');
  });
});
