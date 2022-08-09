const selectObjProperties = (obj: Object, ...args: string[]): Object => {
  // @ts-ignore
  return Object.assign(...args.map((d) => ({ [d]: obj[d] })));
};

const loadPlayerFallbackImage = (e) => {
  e.target.src =
    'https://platform-static-files.s3.amazonaws.com/premierleague/photos/players/40x40/Photo-Missing.png';
};

function getImageUrl(name) {
  return new URL(`/assets/svg/teams/${name}.svg`, import.meta.url).href;
}

export { selectObjProperties, loadPlayerFallbackImage, getImageUrl };
