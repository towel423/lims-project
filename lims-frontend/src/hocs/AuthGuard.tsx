"use client"; // Keep this line

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation"; // Correct hook for navigation
import { loadJwtFromStorage } from "@/redux-store/slices/jwt"; // Import the action to load JWT from localStorage
import { RootState } from "@/redux-store/index"; // Adjust the import based on your store structure
import type { Locale } from "@configs/i18n";
import type { ChildrenType } from "@core/types";
import { getLocalizedUrl } from "../utils/i18n";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "jotai";
import { useProfileData } from "../hooks/data/useProfileData";
import { setProfile } from "../redux-store/slices/profile";
// Create a client
const queryClient = new QueryClient();
export default function AuthGuard({
  children,
  locale,
}: ChildrenType & { locale: Locale }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const token = useSelector((state: RootState) => state.jwt.token); // Get the token from Redux
  const [loading, setLoading] = useState<boolean>(true); // Add loading state
  useEffect(() => {
    // Load JWT from localStorage when the app starts
    dispatch(loadJwtFromStorage());
    setLoading(false); // Set loading to false after loading the token
  }, [dispatch]);

  useEffect(() => {
    // Check if the token is available
    if (!token) {
      // If no token, redirect to login
      const redirectUrl = getLocalizedUrl(`/login`, locale);
      router.push(redirectUrl);
    }
    const getProfile = async () => {
      const profileData = await useProfileData(token); // Profile fetching is asynchronous
      dispatch(
        setProfile({
          ...profileData.data,
        })
      );
    };
    if (token) {
      getProfile();
    }
  }, [token, loading, router, locale]); // Add loading to dependencies
  if (loading) {
    return <div>Loading...</div>; // Or some loading indicator
  }

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Provider>{children}</Provider>
      </QueryClientProvider>
    </>
  ); // Render children if the token is valid
}
