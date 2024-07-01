export const slug = (str: string) => {
  return str
    .toLowerCase()
    .replace(/[äå]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

export function arrayMove<T>(arr: T[], from: number, to: number) {
  const newArray = arr.slice();

  newArray.splice(to, 0, newArray.splice(from, 1)[0]);

  return newArray;
}
