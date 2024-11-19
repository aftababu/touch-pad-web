import { atom } from "jotai";

export interface configAtomtypes {
  size: number;
  thinning: number;
  smoothing: number;
  streamline: number;
  color: string;
};

// Main configuration atom
export const configAtom = atom<configAtomtypes>({
  size: .5,          
  thinning: 0,      
  smoothing: 0,   
  streamline: 0,  
  color: "black",   
});

// Derived atom to update specific properties in configAtom
export const updateConfigAtom = atom(
  null, // No read function
  (get, set, { key, value }) => {
    set(configAtom, { ...get(configAtom), [key]: value });
  }
);
