const PLACEHOLDER_PLAYER_IMAGE =
  'https://platform-static-files.s3.amazonaws.com/premierleague/photos/players/40x40/Photo-Missing.png';

const loadPlayerFallbackImage = (e: Event) => {
  (<HTMLImageElement>e.target).src = PLACEHOLDER_PLAYER_IMAGE;
};

function getImageUrl(name: string) {
  return new URL(`/assets/svg/teams/${name}.svg`, import.meta.url).href;
}

export { loadPlayerFallbackImage, PLACEHOLDER_PLAYER_IMAGE, getImageUrl };
