import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setJwt } from "../redux-store/slices/jwt";
import { setAbilities } from "../redux-store/slices/ability";
import { setProfile } from "../redux-store/slices/profile";
import { useProfileData } from "./data/useProfileData";
import { setrpd } from "../redux-store/slices/rpd";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;

interface LoginData {
  username: string;
  password: string;
}

interface UseLoginReturn {
  login: (data: LoginData) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

const useLogin = (): UseLoginReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useDispatch();

  const login = async (data: LoginData): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${apiUrl}auth/login`, {
        username: data.username,
        password: data.password,
        redirect: false,
        json: true,
      });

      if (response.status === 200 && response.data) {
        const token = response.data.data.token;
        const rules = response.data.data.rules;
        const rpd = response.data.data.rpd;

          // Kosongkan rules di localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("rules");

          // Simpan rules baru
          if (rules && Array.isArray(rules)) {
            localStorage.setItem("rules", JSON.stringify(rules));
          } else {
            console.warn("No rules found in the response");
          }
        }

          // Kosongkan rules di localStorage
          if (typeof window !== "undefined") {
            localStorage.removeItem("rpd");
  
            // Simpan rules baru
            if (rpd && Array.isArray(rpd)) {
              localStorage.setItem("rpd", JSON.stringify(rpd));
            } else {
              console.warn("No rules found in the response");
            }
          }

        // console.log("🚀 ~ login ~ response.data.data:", response.data.data);

        // Save JWT token and abilities in Redux
        dispatch(setJwt(token));
        dispatch(setAbilities(response.data.data.permissions));
        // dispatch(setRules(response.data.data.rules));
        dispatch(setrpd(response.data.data.rpd));

        // Fetch profile data after login and store in Redux
        const profileData = await useProfileData(token); // Profile fetching is asynchronous
        dispatch(setProfile(profileData.data));

        return true;
      } else {
        setError("Invalid credentials");
        return false;
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "An error occurred during login."
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading, error };
};

export default useLogin;
