const pluralise = (count: number, noun: string, suffix = 's') =>
    `${count} ${noun}${count !== 1 ? suffix : ''}`;

export { pluralise };