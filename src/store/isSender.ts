import { atom, useAtom } from 'jotai';

// Define the atom
export const isSenderAtom = atom<boolean>(false);

// Setter function
export const useSetIsSender = () => {
  const [, setIsSender] = useAtom(isSenderAtom);
  
  return (isSender: boolean) => {
    setIsSender(isSender);
  };
};

export default useSetIsSender;
