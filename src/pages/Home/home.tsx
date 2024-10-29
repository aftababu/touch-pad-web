import { useEffect, useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CircleFadingPlusIcon,
  PanelLeftOpenIcon,
  PanelRightOpenIcon,
  Trash,
} from "lucide-react";
import Context from "./context";
import Paint from "./paint";
import PaintPreview from "./paintPreview";

interface Page {
  id: number; 
  title: string; 
  content: string; 
}

interface StrokesMap {
  [key: string]: Array<{ points: Array<{ x: number; y: number }>; color: string; size: number }>; 
}

const Home: React.FC = () => {
  const [pages, setPages] = useState<Page[]>(() => {
    const savedPages = localStorage.getItem("pages");
    return savedPages
      ? JSON.parse(savedPages)
      : [{ id: 1, title: "Page 1", content: "" }];
  });

  const [currentPageId, setCurrentPageId] = useState<number>(1);
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(true);

  const [strokesMap, setStrokesMap] = useState<StrokesMap>(() => {
    const savedStrokes = localStorage.getItem("strokesMap");
    return savedStrokes ? JSON.parse(savedStrokes) : {};
  });

  useEffect(() => {
    localStorage.setItem("pages", JSON.stringify(pages));
  }, [pages]);

  useEffect(() => {
    localStorage.setItem("strokesMap", JSON.stringify(strokesMap));
  }, [strokesMap]);

  const addNewPage = () => {
    const newPageId = pages.length + 1;
    const newPage: Page = { id: newPageId, title: `Page ${newPageId}`, content: "" };
    setPages((prevPages) => [...prevPages, newPage]);
    setCurrentPageId(newPageId);
  };

  const handlePageChange = (id: number) => setCurrentPageId(id);

  return (
    <div className="h-screen w-screen z-50">
      <Tabs value={`page-${currentPageId}`} className="z-50">
        <ResizablePanelGroup
          direction="horizontal"
          className="rounded-lg border max-h-screen absolute left-0 right-0 top-0 bottom-0"
        >
          <ResizablePanel
            style={{
              flex: isPanelOpen ? "20 1 0px" : "0 1 0px",
              transition: "flex 0.3s ease",
              overflow: "hidden",
            }}
          >
            <TabsList className="flex flex-col justify-start gap-3 h-full py-3 px-2 overflow-y-auto">
              {pages.map((page) => (
                <div key={page.id} className="relative">
                  <p>{page.title}</p>
                  <TabsTrigger
                    value={`page-${page.id}`}
                    onClick={() => handlePageChange(page.id)}
                    className="w-full flex-col aspect-square bg-white shadow-md rounded-md flex items-center justify-center"
                  >
                    <Trash
                      className="text-red-400 w-8 h-8 absolute top-8 right-2"
                      onClick={() => {
                        setPages((prevPages) => prevPages.filter((p) => p.id !== page.id));
                        setStrokesMap((prevMap) => {
                          const newMap = { ...prevMap };
                          delete newMap[`page-${page.id}`];
                          return newMap;
                        });
                      }}
                    />
               
                    <PaintPreview
                      strokes={strokesMap[`page-${page.id}`] || []}
                    />
                  </TabsTrigger>
                </div>
              ))}
              <div
                onClick={addNewPage}
                className="w-full h-16 bg-white rounded-full flex justify-center items-center mt-4 cursor-pointer shadow-sm"
              >
                <CircleFadingPlusIcon className="text-gray-400 w-10 h-10" />
              </div>
            </TabsList>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            defaultSize={80}
            style={{
              flex: isPanelOpen ? "80 1 0px" : "100 1 0px",
              transition: "flex 0.3s ease",
              overflow: "hidden",
            }}
          >
            <Context>
              <div className="self-start mr-auto m-4">
                <div
                  onClick={() => setIsPanelOpen(!isPanelOpen)}
                  className="cursor-pointer"
                >
                  {isPanelOpen ? (
                    <PanelRightOpenIcon className="text-gray-500 w-8 h-8" />
                  ) : (
                    <PanelLeftOpenIcon className="text-gray-500 w-8 h-8" />
                  )}
                </div>
              </div>

              <div className="h-full w-full flex items-center justify-center p-6">
                <TabsContent
                  value={`page-${currentPageId}`}
                  className="h-full w-full"
                >
                  <Paint
                    value={`page-${currentPageId}`}
                    // @ts-expect-error TODO
                    strokesMap={strokesMap}
                    // @ts-expect-error TODO
                    setStrokesMap={setStrokesMap}
                  />
                </TabsContent>
              </div>
            </Context>
          </ResizablePanel>
        </ResizablePanelGroup>
      </Tabs>
    </div>
  );
};

export default Home;
