import { atom, useAtom } from "jotai";

// Define the atom with the state of the dialogs
export const feature = atom<{ generateLink?: string; generateModel?: boolean }>({
    generateModel: false,
    generateLink: "", 
  });

// Setter function to update dialog states
export const useFeature = () => {
  const [, setFeature] = useAtom(feature); // Get the setter function

  return (generateLink: string, generateModel?: boolean) => {
    setFeature({ generateLink: generateLink, generateModel: generateModel });
  };
};

export default useFeature;
