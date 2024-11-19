import { useState, useEffect } from "react";

export const useSearchParams = () => {
  const [params, setParams] = useState(new URLSearchParams(window.location.search));

  useEffect(() => {
    const handleSearchChange = () => {
      setParams(new URLSearchParams(window.location.search));
    };

    // Listen for changes to the URL (if needed)
    window.addEventListener("popstate", handleSearchChange);

    return () => {
      window.removeEventListener("popstate", handleSearchChange);
    };
  }, []);

  return params;
};
