import { feature } from "@/store/feature";
import { useAtom } from "jotai";
import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const IdModel = ({
  handleGenarateLink,
  handleSetLink,
}: {
  handleGenarateLink: () => void;
  handleSetLink: () => void;
}) => {
  const [features, setFeature] = useAtom(feature);
  return (
    <>
      <div className="flex flex-col gap-3 items-center justify-center relative inset-0 w-screen h-screen bg-[#f8f8f8] p-4 shadow-sm rounded-md ">
        <div className="flex gap-5">
          <Input
            type="text"
            placeholder="type a id"
            onChange={(e) =>
                setFeature((prev) => ({ ...prev, generateLink: e.target.value }))
              }
          />
          <Button
            className="bg-blue-400  hover:bg-blue-600 px-5"
            size={"sm"}
            onClick={() => handleSetLink()}
          >
            SET_ID
          </Button>
        </div>
        or
        <Button
          className="bg-blue-400  hover:bg-blue-600 w-72"
          size={"sm"}
          onClick={() => handleGenarateLink()}
        >
          GENERATE_ID
        </Button>
        
      </div>
    </>
  );
};

export default IdModel;
