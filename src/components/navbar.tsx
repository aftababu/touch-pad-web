import {
  Github,
  Keyboard,
  LogOut,
  Settings,
  SlidersHorizontalIcon,
  User,
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

const Navbar = () => {
  const [isSender] = useAtom(isSenderAtom);
  const setIsSender = useSetIsSender();
  return (
    <div className="fixed top-0 right-0 z-40 p-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SlidersHorizontalIcon className="cursor-pointer w-6  md:w-8 md:h-8 xl:w-[2.5rem] xl:h-[2.5rem]" />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <User />
              <span>aftabwaih</span>
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings />
              <span>Settings</span>
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
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
            <Github />
            <span>GitHub</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <LogOut />
            <span>Log out</span>
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default Navbar;
