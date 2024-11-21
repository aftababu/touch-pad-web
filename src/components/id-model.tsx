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
  const [, setFeature] = useAtom(feature);
  return (
    <>
      <div className="flex flex-col  gap-3 items-center justify-center  w-screen h-screen bg-[#f8f8f8] p-4 shadow-md rounded-md ">

        <div className=" overflow-hidden font-serif bg-gray-100 w-full h-10 absolute top-1">
          <div className="animate-scroll whitespace-nowrap">
            <b> Step 1: </b> Generate a unique ID for your session. <b> Step 2: </b>{" "}
            Enter the same ID on both devices.
            <b> Step 3: </b> On the device you want to use as a touchpad, go to
            the top-right menu, click More, and enable the Sender option. You're
            now ready to draw!
          </div>

          <style >{`
            @keyframes scroll {
              0% {
                transform: translateX(100%);
              }
              100% {
                transform: translateX(-100%);
              }
            }
            .animate-scroll {
              display: inline-block;
              animation: scroll 15s linear infinite;
            }
            .animate-scroll:hover {
              animation-play-state: paused;
            }
          `}</style>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 w-max  shadow-md p-2 sm:w-[400px] sm:h-[200px]">
          <div className="flex gap-5 ">
            <Input
              type="text"
              placeholder="type a id"
              onChange={(e) =>
                setFeature((prev) => ({
                  ...prev,
                  generateLink: e.target.value,
                }))
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
          <a href="https://gist.github.com/aftababu/c9c929466f355ad62d274fe8dac19b0c" className="text-blue-500 underline">user guide</a>
      </div>
    </>
  );
};

export default IdModel;
