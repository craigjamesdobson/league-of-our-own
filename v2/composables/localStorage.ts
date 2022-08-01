const localStorageHas = (key: string): Boolean => {
  return !!localStorage.getItem(key);
};

const localStorageGet = (key: string): [] | {} => {
  const item = localStorage.getItem(key);

  if (!item) throw new Error('No storage item with that key');

  if (item[0] === '{' || item[0] === '[') return JSON.parse(item);

  return item;
};

const localStorageSet = (key: string, value): void => {
  if (typeof value === 'object' || Array.isArray(value)) {
    value = JSON.stringify(value);
  }

  localStorage.setItem(key, value);
};

export { localStorageHas, localStorageGet, localStorageSet };
