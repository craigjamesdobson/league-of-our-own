export const selectObjProperties = (obj: Object, ...args: string[]): Object => {
  // @ts-ignore
  return Object.assign(...args.map((d) => ({ [d]: obj[d] })));
};

export const loadPlayerFallbackImage = (e) => {
  e.target.src =
    'https://platform-static-files.s3.amazonaws.com/premierleague/photos/players/40x40/Photo-Missing.png';
};
