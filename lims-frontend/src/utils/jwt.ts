import { useState, useEffect } from "react";

export const useCheckJwt = () => {
  const [jwt, setJwt] = useState<{ token: string }>({ token: "" }); // Ensure token is always a string

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedJwt = window.localStorage.getItem("jwt");

      // Ensure we parse only valid JWT structures
      try {
        const parsedJwt = storedJwt ? JSON.parse(storedJwt) : { token: "" };
        setJwt(parsedJwt?.token ? parsedJwt : { token: "" }); // Fallback if parsedJwt is invalid
      } catch (error) {
        console.error("Error parsing JWT from localStorage:", error);
        setJwt({ token: "" }); // Reset token in case of parsing error
      }
    }
  }, []);

  return { jwt };
};
