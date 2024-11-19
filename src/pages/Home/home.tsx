import { useEffect, useState } from "react";

import Context from "./context";
import Paint from "./paint";
import EditPanel from "@/components/edit";
import { useAtom } from "jotai";
import { edit } from "@/store/editPanel";
import { isSenderAtom } from "@/store/isSender";
import { configAtom } from "@/store/paint-adjust";

interface StrokesMap {
  [key: string]: Array<{ points: Array<{ x: number; y: number }>; color: string; size: number }>; 
}

const Home: React.FC = () => {
  const [isSender,] = useAtom(isSenderAtom);
  const [config, ] = useAtom(configAtom);
  const  [{showGrid,move},setDialogOpen ] = useAtom(edit)

  const [strokesMap, setStrokesMap] = useState<StrokesMap>(() => {
    const savedStrokes = localStorage.getItem("strokesMap");
    return savedStrokes ? JSON.parse(savedStrokes) : {};
  });



  useEffect(() => {
    localStorage.setItem("strokesMap", JSON.stringify(strokesMap));
  }, [strokesMap,setStrokesMap]);

  // console.log(showGrid);

  return (
    <div className="h-screen w-screen z-50">
      <EditPanel config={config} isSender={isSender} setDialogOpen={setDialogOpen} strokesMap={strokesMap} setStrokesMap={setStrokesMap} move={move??false}/>
            <Context>
              

              <div className="h-screen w-screen overflow-hidden flex items-center justify-center bg-[#F2F2F2]">
            
                  <Paint
           
                    // @ts-expect-error TODO
                    strokesMap={strokesMap}
                    // @ts-expect-error TODO
                    setStrokesMap={setStrokesMap}
                    // @ts-expect-error TODO
                    showGrid={showGrid}
                    // @ts-expect-error TODO
                    move={move}
                  />
          
              </div>
            </Context>


    </div>
  );
};

export default Home;
