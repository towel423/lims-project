"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const TrafficAnalytics = () => {
  const pathname = usePathname(); // This hook will give the current pathname
  const [location, setLocation] = useState<{ latitude: number | null; longitude: number | null }>({
    latitude: null,
    longitude: null,
  });

  // Function to get the user's location
  const fetchGeolocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          console.log("User Latitude:", latitude, "User Longitude:", longitude);
        },
        (error) => {
          console.error("Error retrieving geolocation:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  useEffect(() => {
    // Fetch geolocation on initial load
    fetchGeolocation();
  }, []);

  useEffect(() => {
    // Whenever the pathname changes, this effect will run
    if (pathname) {
      console.log("Navigated to URL:", pathname);
      console.log("Current location data:", location);

      const jwtString = localStorage.getItem("jwt");
      let authString = ''
      if (jwtString) {
        const jwt = JSON.parse(jwtString); // Parse only if it's not null
        if (jwt && jwt.token) {
          authString = `Bearer ${jwt.token}`;
        }
      }
      // Make a POST request to the backend API every time the pathname changes
      fetch(`${process.env.NEXT_PUBLIC_API_URL}traffic/static`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": authString, // Replace with your actual token
        },
        body: JSON.stringify({
          url: pathname, // The page URL being tracked
          latitude: location.latitude, // User Latitude
          longitude: location.longitude, // User Longitude
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Traffic data sent:", data);
        })
        .catch((error) => {
          console.error("Error tracking traffic:", error);
        });
    }
  }, [pathname, location]); // Re-run this effect whenever `pathname` or `location` changes

  return null;
};

export default TrafficAnalytics;