import { render } from '@testing-library/react';
import { Field } from 'react-final-form';

import { HiddenInput } from './hidden.input';

describe('HiddenInput', () => {
  beforeEach(() => {
    // given
    jest.mocked(Field).mockImplementation(() => <div data-mockid="Field" />);
  });

  it('should match the snapshot', () => {
    // when
    const { container } = render(<HiddenInput name="name-mock" />);

    // then
    expect(container).toMatchSnapshot();
    expect(Field).toHaveBeenCalledOnce();
    expect(Field).toHaveBeenCalledWith(
      {
        component: 'input',
        name: 'name-mock',
        type: 'hidden',
      },
      {},
    );
  });
});
