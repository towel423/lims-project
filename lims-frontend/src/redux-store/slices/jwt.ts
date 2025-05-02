import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the initial state with token
export interface JwtState {
  token: string;
}

function getJwtItem() {
  if (typeof window !== "undefined") {
    return window.localStorage.getItem("jwt") ?? "";
  }
  return ""; // Return an empty string if not in the browser
}

const initialState: JwtState = {
  token: getJwt(getJwtItem()) ?? "", // Safe to initialize now
};


function getJwt(jwt: string | null) {
  if(!jwt) return "";

  let { token } = JSON.parse(jwt);

  if (token) return token;
  return "";
}

function parseJwt(token: string | null): Record<string, any> | string {
    if (!token) {
        return "";
    }

    // JWT is typically divided into 3 parts: header, payload, signature
    const parts = token.split(".");
    if (parts.length !== 3) {
        console.error("Invalid JWT format");
        return "";
    }

    try {
        // Decode the payload (second part of JWT) which is Base64 encoded
        const payload = atob(parts[1]); // Decode Base64 string
        return JSON.parse(payload); // Parse the decoded payload as JSON
    } catch (error) {
        console.error("Failed to parse JWT payload:", error);
        return "";
    }
}
// Create the slice
const jwtSlice = createSlice({
  name: "jwt",
  initialState,
  reducers: {
    setJwt: (state, action: PayloadAction<string>) => {
      state.token = action.payload; // Update the token
      // Save the token to localStorage
      window.localStorage.setItem(
        "jwt",
        JSON.stringify({ token: action.payload })
      );
    },
    clearJwt: state => {
      state.token = ""; // Clear the token
      // Remove the token from localStorage
      window.localStorage.removeItem("jwt");
    },
    loadJwtFromStorage: state => {
      // Initialize JWT from localStorage if available
      const storedJwt = window.localStorage.getItem("jwt");

      const jwtParse = parseJwt(storedJwt)
      const parsedJwt = storedJwt ? ((typeof jwtParse === "object") ? jwtParse.token : ""): "";      
    },
  },
});

export const { setJwt, clearJwt, loadJwtFromStorage } = jwtSlice.actions;
export default jwtSlice.reducer;
