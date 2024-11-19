import { atom, useAtom } from 'jotai';
import { useEffect } from 'react';

// Define the atom
export const isSenderAtom = atom<boolean>(sessionStorage.getItem('isSender') === 'true');

// Setter function
export const useSetIsSender = () => {
  const [isSender, setIsSender] = useAtom(isSenderAtom);
  useEffect(() => {
    sessionStorage.setItem('isSender', String(isSender));
  },[setIsSender,isSender])
  return (isSender: boolean) => {
    setIsSender(isSender);
  };
};

export default useSetIsSender;
