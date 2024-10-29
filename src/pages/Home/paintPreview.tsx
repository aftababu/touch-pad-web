import { getStroke } from "perfect-freehand";
import { getSvgPathFromStroke } from "./utils";

interface Stroke {
  points: Array<{ x: number; y: number }>;
  color: string; 
  size: number; 
}

interface PaintPreviewProps {
  strokes: Stroke[]; 
}

const options = {
  size: 3, 
  thinning: 0.5,
  smoothing: 0.5,
  streamline: 0.5,
  easing: (t: number) => t,
  start: {
    taper: 0,
    easing: (t: number) => t,
    cap: true,
  },
  end: {
    taper: 100,
    easing: (t: number) => t,
    cap: true,
  },
};

const PaintPreview: React.FC<PaintPreviewProps> = ({ strokes }) => {
  if (!Array.isArray(strokes)) {
    console.error('Expected strokes to be an array, but received:', strokes);
    return null; 
  }

  const pathData = strokes.map((stroke) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { points, color, size } = stroke; 
    return getSvgPathFromStroke(getStroke(points, { ...options, size })); 
  });

  const boundingBox = pathData.reduce(
    (acc, path) => {
      const { x, y, width, height } = getPathBoundingBox(path);
      return {
        x: Math.min(acc.x, x),
        y: Math.min(acc.y, y),
        width: Math.max(acc.width, width),
        height: Math.max(acc.height, height),
      };
    },
    { x: Infinity, y: Infinity, width: 0, height: 0 }
  );

  if (boundingBox.x === Infinity) {
    boundingBox.x = 0;
    boundingBox.y = 0;
    boundingBox.width = 100;
    boundingBox.height = 100;
  }

  return (
    <svg
      className="w-full h-full"
      style={{ touchAction: "none" }}
      viewBox={`${boundingBox.x} ${boundingBox.y} ${boundingBox.width} ${boundingBox.height}`}
    >
      {pathData.map((d, index) => {
        const stroke = strokes[index];
        return (
          <path
            key={index}
            d={d}
            fill="none" 
            stroke={stroke.color} 
            strokeWidth={stroke.size} 
          />
        );
      })}
    </svg>
  );
};

function getPathBoundingBox(path: string) {
  const svgNamespace = "http://www.w3.org/2000/svg";
  const tempSvg = document.createElementNS(svgNamespace, "svg");
  const pathElement = document.createElementNS(svgNamespace, "path");

  pathElement.setAttribute("d", path);
  tempSvg.appendChild(pathElement);

  document.body.appendChild(tempSvg);
  const bbox = pathElement.getBBox();
  document.body.removeChild(tempSvg); 

  return {
    x: bbox.x,
    y: bbox.y,
    width: bbox.width,
    height: bbox.height,
  };
}

export default PaintPreview;
