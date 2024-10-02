import { RedirectException } from '../../exceptions';

export const redirectToUrl = (url: string): void => {
  try {
    const { href } = new URL(url);
    window.location.href = href;
  } catch (e) {
    throw new RedirectException();
  }
};
