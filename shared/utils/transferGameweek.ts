export const getTransferTargetGameweek = (currentGameweek: number): number | null => {
  if (!Number.isInteger(currentGameweek) || currentGameweek < 1 || currentGameweek >= 38) {
    return null;
  }

  return currentGameweek + 1;
};
