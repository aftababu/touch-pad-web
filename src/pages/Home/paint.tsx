import * as React from "react";
import { getStroke } from "perfect-freehand";
import { getSvgPathFromStroke } from "./utils";
import { useAtom } from "jotai";
import { configAtom } from "@/store/paint-adjust";
import { isSenderAtom } from "@/store/isSender";

interface Stroke {
    type: 'stroke';
    points: number[][];
    color: string;
    size: number;
}

interface PaintProps {
    value: string;
    strokesMap: Record<string, Stroke[]>;
    setStrokesMap: React.Dispatch<React.SetStateAction<Record<string, Stroke[]>>>;
}

// Use a WebSocket instance outside the component to keep a single connection for all renders
const socketUrl = import.meta.env.VITE_WEBSOCKET || 'ws://localhost:8080';
let socket: WebSocket;

function connectWebSocket(setIsSocketOpen: React.Dispatch<React.SetStateAction<boolean>>) {
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

const Paint: React.FC<PaintProps> = ({ value, strokesMap, setStrokesMap }) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [points, setPoints] = React.useState<number[][]>([]);
    const [currentStroke, setCurrentStroke] = React.useState<Stroke | null>(null);
    const [config] = useAtom(configAtom);
    const [isSender] = useAtom(isSenderAtom);
   
    const [isSocketOpen, setIsSocketOpen] = React.useState(false);
    if (!isSocketOpen) {
       console.log("Connecting WebSocket...");
      }
    React.useEffect(() => {
        connectWebSocket(setIsSocketOpen);

        socket.onmessage = (event) => {
            // Handle incoming messages
            if (event.data instanceof Blob) {
                event.data.text().then((text) => {
                    const incomingStroke: Stroke = JSON.parse(text);
                    if (!isSender && incomingStroke.type === 'stroke') {
                        console.log(incomingStroke);
                        setStrokesMap((prevMap) => ({
                            ...prevMap,
                            [value]: [
                                ...(prevMap[value] || []),
                                incomingStroke,
                            ],
                        }));
                    }
                }).catch((error) => {
                    console.error("Failed to parse message data:", error);
                });
            } else {
                const incomingStroke: Stroke = JSON.parse(event.data);
                if (!isSender && incomingStroke.type === 'stroke') {
                    console.log(incomingStroke);
                    setStrokesMap((prevMap) => ({
                        ...prevMap,
                        [value]: [
                            ...(prevMap[value] || []),
                            incomingStroke,
                        ],
                    }));
                }
            }
        };

        return () => {
            if (socket) {
                console.log("Closing WebSocket connection...");
                socket.close();
            }
        };
    }, [isSender, value, setStrokesMap]);

    function getRelativeCoordinates(e: React.PointerEvent<SVGSVGElement>): number[] {
        const svg = e.target as SVGSVGElement;
        const rect = svg.getBoundingClientRect();
        return [e.clientX - rect.left, e.clientY - rect.top];
    }

    function handlePointerDown(e: React.PointerEvent<SVGSVGElement>) {
        (e.target as SVGSVGElement).setPointerCapture(e.pointerId);
        const coords = getRelativeCoordinates(e);
        setPoints([coords]);
      
        setCurrentStroke({ type: 'stroke', points: [coords], color: config.color, size: config.size });
    }
    function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
        if (e.buttons !== 1) return;
        const coords = getRelativeCoordinates(e);
        
        setPoints((prevPoints) => {
            const newPoints = [...prevPoints, coords];
            const newStroke: Stroke = { type: 'stroke', points: newPoints, color: config.color, size: config.size };
            setCurrentStroke(newStroke);
            localStorage.setItem('drawingData', JSON.stringify(newPoints)); // Save continuously
            return newPoints;
        });
    }
    
    function handlePointerUp() {
        if (currentStroke) {
            // Retrieve all drawing data from local storage
            const drawingData = JSON.parse(localStorage.getItem('drawingData') || '[]');
            const strokeToSend: Stroke = {
                type: 'stroke',
                points: drawingData,
                color: currentStroke.color,
                size: currentStroke.size,
            };

            // Send the entire drawing data when the pointer is released
            if (isSender && socket.readyState === WebSocket.OPEN) {
                console.log(`Sending stroke: ${JSON.stringify(strokeToSend)}`);
                socket.send(JSON.stringify(strokeToSend));
            }

            setStrokesMap((prevMap) => {
                const newMap = {
                    ...prevMap,
                    [value]: [
                        ...(prevMap[value] || []),
                        strokeToSend,
                    ],
                };

                // Save the updated strokes to localStorage
                localStorage.setItem('strokesMap', JSON.stringify(newMap));
                return newMap;
            });
            setPoints([]);
            setCurrentStroke(null);
            localStorage.removeItem('drawingData'); // Clear after sending
        }
    }

    const pathData = (strokesMap[value] || []).map((stroke) =>
        getSvgPathFromStroke(getStroke(stroke.points, {
            size: stroke.size,
            thinning: 0.5,
            smoothing: 0.5,
            streamline: 0.5,
        }))
    );

    const currentPathData = currentStroke ? getSvgPathFromStroke(getStroke(currentStroke.points, {
        size: currentStroke.size,
        thinning: 0.5,
        smoothing: 0.5,
        streamline: 0.5,
    })) : '';

    return (
        <svg
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="w-full h-full"
            style={{ touchAction: "none", border: "1px solid #ccc" }}
        >
            {pathData.map((d, index) => {
                const strokeDetails = strokesMap[value][index];
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
