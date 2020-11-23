export const removeIdentityProvider = (
  previousState: string[],
  name: string,
) => {
  const nextState = previousState.filter((idp: string) => idp !== name);
  return nextState;
};

export default removeIdentityProvider;
