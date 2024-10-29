import React, { useState } from "react";
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

const colors = [
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
  const [fontSizeDialogOpen, setFontSizeDialogOpen] = useState(false);
  const [colorDialogOpen, setColorDialogOpen] = useState(false);
  const [config] = useAtom(configAtom); // Read the entire config
  const [, updateConfig] = useAtom(updateConfigAtom); // Access the updater

  const handleColorSelect = (color: string) => {
    updateConfig({ key: "color", value: color });
    setColorDialogOpen(false); // Close the color dialog after selection
  };

  return (
    <div className="h-full w-full">
      <ContextMenu>
        <ContextMenuTrigger className="flex h-full items-center justify-center text-sm">
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuItem inset onClick={() => setFontSizeDialogOpen(true)}>
            Font size
            <ContextMenuShortcut>{config.size}</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem inset onClick={() => setColorDialogOpen(true)}>
            Color
            <ContextMenuShortcut>{config.color}</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Font Size Dialog */}
      <Dialog open={fontSizeDialogOpen} onOpenChange={setFontSizeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Font Size</DialogTitle>
            <Slider
              max={25}
              min={1}
              step={1}
              value={[config.size]}
              onValueChange={(value) =>
                updateConfig({ key: "size", value: value[0] })
              }
            />
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Color Dialog */}
      <Dialog open={colorDialogOpen} onOpenChange={setColorDialogOpen}>
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
                onClick={() => handleColorSelect(color.name)}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Context;
