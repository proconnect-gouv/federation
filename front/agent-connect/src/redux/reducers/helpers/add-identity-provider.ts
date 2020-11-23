export const addIdentityProvider = (previousState: string[], name: string) => {
  const isAlreadyIncludedInPrevState = previousState.includes(name);
  if (isAlreadyIncludedInPrevState) {
    return previousState;
  }
  const nextState = [name, ...previousState].slice(0, 3);
  return nextState;
};

export default addIdentityProvider;
