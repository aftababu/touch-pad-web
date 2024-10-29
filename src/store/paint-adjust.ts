import { atom } from "jotai";

// Main configuration atom
export const configAtom = atom({
  size: 4,
  thinning: 0.5,
  smoothing: 0.5,
  streamline: 0.5,
  color: "black",
});

// Derived atom to update specific properties in configAtom
export const updateConfigAtom = atom(
  null, // No read function
  (get, set, { key, value }) => {
    set(configAtom, { ...get(configAtom), [key]: value });
  }
);
