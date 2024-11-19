import { atom, useAtom } from "jotai";

export interface edittype {
  fontSizeDialogOpen?: boolean;
  colorDialogOpen?: boolean;
  showGrid?: boolean;
  move?: boolean;
}

export const edit = atom<edittype>({
  fontSizeDialogOpen: false,
  colorDialogOpen: false,
  showGrid: true,
  move: false,
});

export const useSetDialogOpen = () => {
  const [dialogState, setDialogOpen] = useAtom(edit); 
// console.log("hello",dialogState);
  return (
    fontOpen?: boolean,
    colorOpen?: boolean,
    showGrid?: boolean,
    move?: boolean
  ) => {
    setDialogOpen({
      fontSizeDialogOpen: fontOpen ?? dialogState.fontSizeDialogOpen,
      colorDialogOpen: colorOpen ?? dialogState.colorDialogOpen,
      showGrid: showGrid ?? dialogState.showGrid,
      move: move ?? dialogState.move,
    });
  };
};

export default useSetDialogOpen;
