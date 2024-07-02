import { useState } from 'react';

const useForm = <T>(initialValues: T) => {
  const [values, setValues] = useState<T>(initialValues);

  return [
    values,
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValues({
        ...values,
        [e.target.name]: e.target.value,
      });
    },
  ] as [T, (e: React.ChangeEvent<HTMLInputElement>) => void];
};

export default useForm;
