import { render } from '@testing-library/react';

import { FormMentionsComponent } from './form-mentions.component';

describe('FormMentionsComponent', () => {
  it('should match the snapshot', () => {
    // when
    const { container } = render(<FormMentionsComponent />);

    // then
    expect(container).toMatchSnapshot();
  });
});
