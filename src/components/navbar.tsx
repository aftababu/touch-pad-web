import {
  Github,
  Keyboard,
  Settings,
  SlidersHorizontalIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAtom } from "jotai";
import useSetIsSender, { isSenderAtom } from "@/store/isSender";
import { Switch } from "./ui/switch";

import { feature } from "@/store/feature";
import IdModel from "./id-model";

const Navbar = ({ handleGenarateLink,handleSetLink }: { handleGenarateLink: () => void ,handleSetLink: () => void}) => {
  const [isSender] = useAtom(isSenderAtom);
  const [features, setFeature] = useAtom(feature);
  const setIsSender = useSetIsSender();
  return (
    <>
      <div className="fixed top-0 right-0 z-40 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SlidersHorizontalIcon className="cursor-pointer w-6  md:w-8 md:h-8 xl:w-[2.5rem] xl:h-[2.5rem]" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Features</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <div onClick={() => setFeature({ generateModel: true })}>
                <DropdownMenuItem>
                  <Settings />
                  <span>Link to device</span>
                  <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                </DropdownMenuItem>
              </div>

              <DropdownMenuItem className="justify-between">
                <span>sender</span>
                <Switch
                  id="send-mode"
                  checked={isSender}
                  onCheckedChange={setIsSender}
                />
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Keyboard />
                <span>Keyboard shortcuts</span>
                <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <a href="https://github.com/aftababu/touch-pad-web" target="_blank" className="flex gap-2 items-center justify-center">
              <Github />
              <span>GitHub</span>
              </a>
            </DropdownMenuItem>

          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {
        features.generateModel && (
          <IdModel handleGenarateLink={handleGenarateLink} handleSetLink={handleSetLink}/>
        )
      }
    </>
  );
};

export default Navbar;
