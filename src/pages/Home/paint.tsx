import * as React from "react";
import { getStroke } from "perfect-freehand";
import { getSvgPathFromStroke } from "./utils";
import { useAtom } from "jotai";
import { configAtom } from "@/store/paint-adjust";
import { isSenderAtom } from "@/store/isSender";
import { useSearchParams } from "@/hooks/useSearchParams";

interface Stroke {
  type: "stroke";
  points: number[][];
  color: string;
  size: number;
}

interface PaintProps {
  strokesMap: Record<string, Stroke[]>;
  setStrokesMap: React.Dispatch<React.SetStateAction<Record<string, Stroke[]>>>;
  showGrid: boolean;
  move: boolean;
}

export let socket: WebSocket;

function connectWebSocket(
  socketUrl: string,
  setIsSocketOpen: React.Dispatch<React.SetStateAction<boolean>>
) {
  socket = new WebSocket(socketUrl);

  socket.onopen = () => {
    console.log("WebSocket connection established.");
    setIsSocketOpen(true);
  };

  socket.onclose = (event) => {
    console.log("WebSocket connection closed:", event.reason);
    setIsSocketOpen(false);

    // Attempt reconnection after 1 second
    setTimeout(() => {
      console.log("Reconnecting WebSocket...");
      connectWebSocket(socketUrl, setIsSocketOpen);
    }, 1000);
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
}

const Paint: React.FC<PaintProps> = ({
  strokesMap,
  setStrokesMap,
  showGrid,
  move,
}) => {
  const [points, setPoints] = React.useState<number[][]>([]);
  const [viewBox, setViewBox] = React.useState({
    x: 0,
    y: 0,
    width: 1000,
    height: 1000,
  });
  const [currentStroke, setCurrentStroke] = React.useState<Stroke | null>(null);
  const [config] = useAtom(configAtom);
  const [isSender] = useAtom(isSenderAtom);
  const [, setIsSocketOpen] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startDragPosition, setStartDragPosition] = React.useState<{
    x: number;
    y: number;
  } | null>(null);
  const searchParams = useSearchParams();

  React.useEffect(() => {
    // Dynamically construct WebSocket URL based on searchParams and isSender
    const id = searchParams.get("id");
    // console.log(id);
    const url = `${
      import.meta.env.VITE_WEBSOCKET || "ws://localhost:8080"
    }?id=${id}&isSender=${isSender}`;

    connectWebSocket(url, setIsSocketOpen);

    socket.onmessage = async (event) => {
      if (!isSender) {
        try {
          const messageText = await event.data.text(); // Convert Blob to text
          // console.log("Received message receiver:", JSON.parse(messageText));
          const incomingStroke = JSON.parse(messageText);

          if (incomingStroke.type === "stroke") {
            setStrokesMap((prevMap) => ({
              ...prevMap,
              strokes: [...(prevMap.strokes || []), incomingStroke],
            }));
          } else if (incomingStroke.type === "delete") {
            localStorage.removeItem("strokesMap");
            setStrokesMap({ strokes: [] });
          } else if (incomingStroke.type === "undo") {
            setStrokesMap((prevMap) => ({
              ...prevMap,
              strokes: incomingStroke.newStrokes,
            }));
            localStorage.setItem(
              "strokesMap",
              JSON.stringify({ strokes: incomingStroke.newStrokes })
            );
          }
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      }
    };
    return () => socket?.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function getRelativeCoordinates(
    e: React.PointerEvent<SVGSVGElement>
  ): number[] {
    const rect = (e.target as SVGSVGElement).getBoundingClientRect();
    const scaleX = viewBox.width / rect.width;
    const scaleY = viewBox.height / rect.height;
    return [
      (e.clientX - rect.left) * scaleX + viewBox.x,
      (e.clientY - rect.top) * scaleY + viewBox.y,
    ];
  }

  function handlePointerDown(e: React.PointerEvent<SVGSVGElement>) {
    if (move) {
      setIsDragging(true);
      setStartDragPosition({ x: e.clientX, y: e.clientY });
    } else {
      (e.target as SVGSVGElement).setPointerCapture(e.pointerId);
      const coords = getRelativeCoordinates(e);
      setPoints([coords]);
      setCurrentStroke({
        type: "stroke",
        points: [coords],
        color: config.color,
        size: config.size,
      });
    }
  }
  // console.log(config.color);
  const handlePointerMove = React.useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (move) {
        if (!isDragging || !startDragPosition) return;

        // Calculate the drag distance with adjusted scale
        const dx = (e.clientX - startDragPosition.x) * (viewBox.width / 1000);
        const dy = (e.clientY - startDragPosition.y) * (viewBox.height / 1000);

        setViewBox((prevViewBox) => ({
          ...prevViewBox,
          x: prevViewBox.x - dx,
          y: prevViewBox.y - dy,
        }));

        // Update the starting drag position
        setStartDragPosition({ x: e.clientX, y: e.clientY });
      } else {
        if (e.buttons !== 1) return;
        const coords = getRelativeCoordinates(e);
        setPoints((prevPoints) => {
          const newPoints = [...prevPoints, coords];
          setCurrentStroke((prevStroke) => ({
            ...prevStroke!,
            points: newPoints,
          }));
          return newPoints;
        });
      }
    },
    [viewBox, isDragging, startDragPosition, move]
  );

  function handlePointerUp() {
    if (move) {
      setIsDragging(false);
      setStartDragPosition(null);
    } else {
      if (currentStroke) {
        const strokeToSend: Stroke = { ...currentStroke, points: points };
        if (isSender && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify(strokeToSend));
        }
        setStrokesMap((prevMap) => ({
          ...prevMap,
          strokes: [...(prevMap.strokes || []), strokeToSend],
        }));
        setPoints([]);
        setCurrentStroke(null);
      }
    }
  }

  function handleWheel(e: React.WheelEvent<SVGSVGElement>) {
    const zoomFactor = 1.1;
    const { x, y, width, height } = viewBox;
    const direction = e.deltaY > 0 ? 1 : -1;
    const newWidth = direction > 0 ? width * zoomFactor : width / zoomFactor;
    const newHeight = direction > 0 ? height * zoomFactor : height / zoomFactor;

    setViewBox({
      x: x + (width - newWidth) / 2,
      y: y + (height - newHeight) / 2,
      width: newWidth,
      height: newHeight,
    });
  }

  function generateGridLines(
    viewBox: { x: number; y: number; width: number; height: number },
    gridSpacing: number
  ) {
    const verticalLines = Array.from(
      { length: Math.ceil(viewBox.width / gridSpacing) + 1 },
      (_, i) => (
        <line
          key={`v-${i}`}
          x1={viewBox.x + i * gridSpacing}
          y1={viewBox.y}
          x2={viewBox.x + i * gridSpacing}
          y2={viewBox.y + viewBox.height}
          stroke="#d9d7d7"
          strokeWidth="0.5"
        />
      )
    );

    const horizontalLines = Array.from(
      { length: Math.ceil(viewBox.height / gridSpacing) + 1 },
      (_, i) => (
        <line
          key={`h-${i}`}
          x1={viewBox.x}
          y1={viewBox.y + i * gridSpacing}
          x2={viewBox.x + viewBox.width}
          y2={viewBox.y + i * gridSpacing}
          stroke="#d9d7d7"
          strokeWidth="0.5"
        />
      )
    );

    return [...verticalLines, ...horizontalLines];
  }

  const pathData = (strokesMap.strokes || []).map((stroke) =>
    getSvgPathFromStroke(
      getStroke(stroke.points, {
        size: stroke.size,
        thinning: 0,
        smoothing: 0,
        streamline: 0,
      })
    )
  );

  const currentPathData = currentStroke
    ? getSvgPathFromStroke(
        getStroke(currentStroke.points, {
          size: currentStroke.size,
          thinning: 0,
          smoothing: 0,
          streamline: 0,
        })
      )
    : "";
  let maxWidth = window.innerWidth;
  const baseValue = 1.3;
  const incrementRate = 0.001;

  maxWidth = Math.max(maxWidth, window.innerWidth);

  const result = baseValue + maxWidth * incrementRate;
  React.useEffect(() => {
    setViewBox((prevViewBox) => {
      const constrainedViewBox = {
        ...prevViewBox,
        width: Math.max(300, Math.min(prevViewBox.width, 5000)),
        height: Math.max(300, Math.min(prevViewBox.height, 5000)),
        x: Math.max(-2200, Math.min(prevViewBox.x, 3000)),
        y: Math.max(-2200, Math.min(prevViewBox.y, 3000)),
      };
  
      // Avoid redundant updates
      if (
        constrainedViewBox.width === prevViewBox.width &&
        constrainedViewBox.height === prevViewBox.height &&
        constrainedViewBox.x === prevViewBox.x &&
        constrainedViewBox.y === prevViewBox.y
      ) {
        return prevViewBox;
      }
  
      return constrainedViewBox;
    });
  }, [viewBox]);
  return (
    <svg
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
      style={{
        touchAction: "none",
        border: "1px solid #ccc",
        cursor: isDragging ? "grabbing" : move ? "grab" : "crosshair",
        transform: `scaleY(${result})`,
      }}
    >
      <style>
        {`
          @media (min-width: 800px) {
            svg {
              transform: scaleY(1) !important;
            }
          }
        `}
      </style>
      {showGrid && <>{generateGridLines(viewBox, 60)}</>}

      {pathData.map((d, index) => {
        const strokeDetails = strokesMap.strokes[index];
        return (
          <path
            key={index}
            d={d}
            fill="none"
            stroke={strokeDetails.color}
            strokeWidth={strokeDetails.size}
          />
        );
      })}

      {currentStroke && currentPathData && (
        <path
          d={currentPathData}
          fill="none"
          stroke={currentStroke.color}
          strokeWidth={currentStroke.size}
        />
      )}
    </svg>
  );
};

export default Paint;
