const selectObjProperties = (obj: object, ...args: string[]): object => {
  // @ts-expect-error: this shouldnt be erroring...
  return Object.assign(...args.map(d => ({ [d]: obj[d] })));
};

const loadPlayerFallbackImage = (e: Event) => {
  (<HTMLImageElement>e.target).src =
    'https://platform-static-files.s3.amazonaws.com/premierleague/photos/players/40x40/Photo-Missing.png';
};

function getImageUrl (name: string) {
  return new URL(`/assets/svg/teams/${name}.svg`, import.meta.url).href;
}

export { selectObjProperties, loadPlayerFallbackImage, getImageUrl };
