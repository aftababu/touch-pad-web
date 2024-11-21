import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export let socket: WebSocket;
export function connectWebSocket(setIsSocketOpen: React.Dispatch<React.SetStateAction<boolean>>) {
  const searchParams = new URLSearchParams(window.location.search);
  const id = searchParams.get("id");
  const socketUrl = `${import.meta.env.VITE_WEBSOCKET || "ws://localhost:8080"}?id=${id}`;
  socket = new WebSocket(socketUrl);

  socket.onopen = () => {
      console.log('WebSocket connection established.');
      setIsSocketOpen(true);
  };

  socket.onclose = (event) => {
      console.log('WebSocket connection closed:', event.reason);
      setIsSocketOpen(false);

      // Attempt reconnection after 1 second
      setTimeout(() => {
          console.log("Reconnecting WebSocket...");
          connectWebSocket(setIsSocketOpen);
      }, 1000);
  };

  socket.onerror = (error) => {
      console.error("WebSocket error:", error);
  };
}
