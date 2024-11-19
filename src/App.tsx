import { useCallback, useEffect, useState } from "react";
import "./App.css";
import Navbar from "./components/navbar";
import Home from "./pages/Home/home";
import { useAtom } from "jotai";
import { feature } from "./store/feature";
import IdModel from "./components/id-model";

function App() {
  const [sessionId, setSessionId] = useState(
    () => sessionStorage.getItem("sessionId") || ""
  );
  const [features] = useAtom(feature);

  const updateUrlWithSessionId = useCallback((id: string) => {
    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set("id", id);
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${searchParams.toString()}`
    );
  }, []);
  const setSession = useCallback(
    (id: string) => {
      sessionStorage.setItem("sessionId", id);
      setSessionId(id);
      updateUrlWithSessionId(id);
    },
    [setSessionId, updateUrlWithSessionId]
  );

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const sessionIdFromUrl = searchParams.get("id");

    if (sessionIdFromUrl) {
      setSession(sessionIdFromUrl);
    } else if (sessionId) {
      updateUrlWithSessionId(sessionId);
    }
  }, [sessionId, setSession]);

  const generateSessionId = () => new Date().getTime().toString().slice(4, 10);

  const handleGenerateLink = () => {
    const newSessionId = generateSessionId();
    setSession(newSessionId);
  };
  const handleSetLink = () => {
    if (features.generateLink) {
      if (features?.generateLink?.length < 6) {
        alert("please set link at least 6 char");
      }
      setSession(features.generateLink);
      window.location.reload();
    }
  };
  if (!sessionId) {
    return (
      <>
        <IdModel
          handleGenarateLink={handleGenerateLink}
          handleSetLink={handleSetLink}
        />
      </>
    );
  }
  return (
    <>
      <Navbar
        handleGenarateLink={handleGenerateLink}
        handleSetLink={handleSetLink}
      />

      <Home />
    </>
  );
}

export default App;
