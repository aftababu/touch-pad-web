import React from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { useAtom } from "jotai";
import { configAtom, updateConfigAtom } from "@/store/paint-adjust";
import { edit } from "@/store/editPanel";
import { CheckIcon, XIcon } from "lucide-react";

export const colors = [
  { name: "black", value: "#1F1F1F" },
  { name: "slate", value: "#6B7280" },
  { name: "red", value: "#EF4444" },
  { name: "green", value: "#10B981" },
  { name: "blue", value: "#3B82F6" },
  { name: "yellow", value: "#FBBF24" },
  { name: "orange", value: "#FB923C" },
  { name: "sky", value: "#38BDF8" },
  { name: "pink", value: "#EC4899" },
  { name: "indigo", value: "#6366F1" },
];

function Context({ children }: { children: React.ReactNode }) {
  const [{ fontSizeDialogOpen, colorDialogOpen, showGrid }, setDialogOpen] =
    useAtom(edit);
  const [config] = useAtom(configAtom);
  const [, updateConfig] = useAtom(updateConfigAtom);

  const handleColorSelect = (color: string) => {
    updateConfig({ key: "color", value: color });

    setDialogOpen((prev) => ({
      ...prev,
      fontSizeDialogOpen: false,
      colorDialogOpen: false,
    }));
  };
// console.log(config.color);
  // console.log(fontSizeDialogOpen,"hello",colorDialogOpen);
  return (
    <div className="h-full w-full">
      <ContextMenu>
        <ContextMenuTrigger className="hello flex h-full items-center justify-center text-sm">
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuItem
            inset
            onClick={() =>
              setDialogOpen((prev) => ({ ...prev, fontSizeDialogOpen: true }))
            }
          >
            Font size
            <ContextMenuShortcut>{config.size}</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem
            inset
            onClick={() =>
              setDialogOpen((prev) => ({ ...prev, colorDialogOpen: true }))
            }
          >
            Color
            <ContextMenuShortcut>
              {
              colors.map((color) => color.value===config.color?color.name:null)
              }
            </ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem
            inset
            onClick={() =>
              setDialogOpen((prev) => ({ ...prev, showGrid: !showGrid }))
            }
          >
            show grid
            <ContextMenuShortcut>
              {showGrid ? (
                <CheckIcon className="w-4 h-4" />
              ) : (
                <XIcon className="w-4 h-4" />
              )}
            </ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Font Size Dialog */}
      <Dialog
        open={fontSizeDialogOpen}
        onOpenChange={(value) =>
          setDialogOpen((prev) => ({ ...prev, fontSizeDialogOpen: value }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Font Size</DialogTitle>
            <Slider
              max={15}
              min={0.1}
              step={0.4}
              value={[config.size]}
              onValueChange={(value) =>
                updateConfig({ key: "size", value: value[0] })
              }
            />
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Color Dialog */}
      <Dialog
        open={colorDialogOpen}
        onOpenChange={(value) =>
          setDialogOpen((prev) => ({ ...prev, colorDialogOpen: value }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Color</DialogTitle>
          </DialogHeader>
          <div className="flex gap-1 flex-wrap">
            {colors.map((color) => (
              <p
                key={color.name}
                style={{ backgroundColor: color.value }}
                className={`w-10 h-10 rounded-full cursor-pointer`}
                onClick={() => handleColorSelect(color.value)}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Context;
