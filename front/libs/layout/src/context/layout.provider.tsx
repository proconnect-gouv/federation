import { type PropsWithChildren } from 'react';
import { useToggle } from 'usehooks-ts';

import type { AccountContextStateInterface } from '@fc/account';
import { AccountContext } from '@fc/account';
import { useSafeContext } from '@fc/common';

import { LayoutContext } from './layout.context';

export const LayoutProvider = ({ children }: PropsWithChildren) => {
  const [menuIsOpened, toggleMenu] = useToggle(false);

  const { connected, ready, userinfos } =
    useSafeContext<AccountContextStateInterface>(AccountContext);
  const isUserConnected = connected && ready;

  return (
    <LayoutContext.Provider
      value={{
        isUserConnected,
        menuIsOpened,
        toggleMenu,
        userinfos,
      }}>
      {children}
    </LayoutContext.Provider>
  );
};
