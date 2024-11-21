import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { colors } from "@/pages/Home/context";
import { socket } from "@/pages/Home/paint";
import { edittype } from "@/store/editPanel";
import { configAtomtypes } from "@/store/paint-adjust";
import { HandIcon, PencilIcon, TrashIcon, UndoIcon } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface EditPanelProps {
  config: configAtomtypes;
  isSender: boolean;
  setDialogOpen: Dispatch<SetStateAction<edittype>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  strokesMap: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setStrokesMap: any;
  move: boolean;
}

const EditPanel = ({
  config,
  isSender,
  setDialogOpen,
  strokesMap,
  setStrokesMap,
  move,
}: EditPanelProps) => {
  const handleDelete = () => {
    const deleteMessage = JSON.stringify({ type: "delete" });
    localStorage.removeItem("strokesMap");
    setStrokesMap({ strokes: [] });
    socket.send(deleteMessage); 
  };
  
  const handleUndo = () => {
    if (strokesMap.strokes.length > 0) {
      const newStrokesMap = {
        ...strokesMap,
        strokes: strokesMap.strokes.slice(0, -1), // creates a new array without the last element
      };
  
      const undoMessage = JSON.stringify({ type: "undo", newStrokes: newStrokesMap.strokes });
      socket.send(undoMessage); // Notify others about the undo action
  
      setStrokesMap(newStrokesMap);
      localStorage.setItem("strokesMap", JSON.stringify(newStrokesMap));
    }
  };
  const colorValue = colors.map((color) =>
    color.value === config.color ? color.name : null
  );
  // console.log(config.color);
  return (
    <div className="absolute top-2 left-2/4 -translate-x-2/4 z-50 flex items-center justify-center gap-3 bg-white px-3 py-2 rounded-lg shadow-sm">
      {!isSender ? (
        <h1 className="bg-red-500 text-gray-300 rounded-lg px-2 scale-75">
          receiver
        </h1>
      ) : (
        <h1 className="bg-green-300 text-gray-700 rounded-lg px-2 scale-75">
          sender
        </h1>
      )}

      <Popover>
        <PopoverTrigger>
          <PencilIcon className="w-5 h-5 hover:text-green-500 transition-all hover:scale-105" />
        </PopoverTrigger>
        <PopoverContent className="w-max relative p-0">
          <ul className="flex flex-col font-mono">
            <li
              className="flex justify-between gap-3 shadow-sm px-3 py-2 hover:bg-gray-100 cursor-pointer transition-all"
              onClick={() =>
                setDialogOpen((prev: edittype) => ({
                  ...prev,
                  fontSizeDialogOpen: true,
                }))
              }
            >
              Font size :<p>{config.size}</p>
            </li>

            <li
              className="flex justify-between gap-3 shadow-sm px-3 py-2 hover:bg-gray-100 cursor-pointer transition-all"
              onClick={() =>
                setDialogOpen((prev: edittype) => ({
                  ...prev,
                  colorDialogOpen: true,
                }))
              }
            >
              Color :
              <p
                style={{
                  color: config.color,
                }}
              >
                {" "}
                {colorValue}
              </p>
            </li>
          </ul>
        </PopoverContent>
      </Popover>
      <p
        onClick={() =>
          setDialogOpen((prev: edittype) => ({ ...prev, move: !move }))
        }
      >
        <HandIcon
          className={`w-5 h-5 ${
            move ? "text-green-500" : "text-gray-500"
          } transition-all hover:scale-105 cursor-pointer`}
        />
      </p>
      <p onClick={() => handleUndo()}>
        <UndoIcon className="w-5 h-5 hover:text-blue-500 transition-all hover:scale-105 cursor-pointer" />
      </p>
      <p onClick={() => handleDelete()}>
        <TrashIcon className="w-5 h-5 hover:text-red-500 transition-all hover:scale-105 cursor-pointer" />
      </p>
    </div>
  );
};

export default EditPanel;
