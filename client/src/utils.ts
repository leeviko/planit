export const checkEmail = (email: string) => {
  if (!email) return false;
  return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);
};
