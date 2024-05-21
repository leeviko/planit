export const slug = (str: string) => {
  return str
    .toLowerCase()
    .replace(/[äå]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};
