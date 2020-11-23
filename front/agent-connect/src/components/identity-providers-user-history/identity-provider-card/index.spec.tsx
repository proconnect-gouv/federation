import userEvent from '@testing-library/user-event';
import React from 'react';

import * as actions from '../../../redux/actions';
import { renderWithRedux } from '../../../testUtils';
import IdentityProviderCard from './index';

xdescribe('IdentityProviderCard', () => {
  describe('when user click on remove button', () => {
    it('should call redux action removeIdentityProvider', () => {
      // setup
      const props = { uid: 'mock-uid' };
      const { getByText } = renderWithRedux(
        <IdentityProviderCard {...props} />,
      );
      const removeButton = getByText('Retirer de cette liste');
      const spy = jest.spyOn(actions, 'removeIdentityProvider');
      // action
      userEvent.click(removeButton);
      // expect
      expect(spy).toHaveBeenCalledTimes(1);
      spy.mockRestore();
    });

    it('should call redux action removeIdentityProvider with the uid property', () => {
      // setup
      const props = { uid: 'mock-uid' };
      const { getByText } = renderWithRedux(
        <IdentityProviderCard {...props} />,
      );
      const removeButton = getByText('Retirer de cette liste');
      const spy = jest.spyOn(actions, 'removeIdentityProvider');
      // action
      userEvent.click(removeButton);
      // expect
      expect(spy).toHaveBeenCalledWith(props.uid);
      spy.mockRestore();
    });

    it('should call redux action removeIdentityProvider and return a redux action', () => {
      // setup
      const props = { uid: 'mock-uid' };
      const { getByText } = renderWithRedux(
        <IdentityProviderCard {...props} />,
      );
      const removeButton = getByText('Retirer de cette liste');
      const spy = jest.spyOn(actions, 'removeIdentityProvider');
      // action
      userEvent.click(removeButton);
      // expect
      expect(spy).toHaveReturnedWith({
        payload: props.uid,
        type: 'IDENTITY_PROVIDER_REMOVE',
      });
      spy.mockRestore();
    });
  });
});
