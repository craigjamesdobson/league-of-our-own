const loadFallbackImage = (e) => {
  e.target.src =
    'https://platform-static-files.s3.amazonaws.com/premierleague/photos/players/40x40/Photo-Missing.png'
}

export { loadFallbackImage }
