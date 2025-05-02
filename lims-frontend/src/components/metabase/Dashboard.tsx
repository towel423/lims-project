// src/components/MetabaseDashboard.tsx
"use client"; // Tambahkan baris ini

import React, { useEffect, useState } from "react";
import jwt from "jsonwebtoken";

const METABASE_SITE_URL = process.env.NEXT_PUBLIC_METABASE_SITE_URL;
const METABASE_SECRET_KEY = process.env.NEXT_PUBLIC_METABASE_SECRET_KEY;
const METABASE_DASHBOARD = parseInt(process.env.NEXT_PUBLIC_METABASE_DASHBOARD_ID || "0", 10);

const MetabaseDashboard: React.FC = () => {
  const [iframeUrl, setIframeUrl] = useState("");

  useEffect(() => {
    // Generate the JWT token
    const payload = {
      resource: { dashboard: METABASE_DASHBOARD },
      params: {},
      exp: Math.round(Date.now() / 1000) + 10 * 60, // 10 minutes expiration
    };

    const token = jwt.sign(payload, METABASE_SECRET_KEY!);

    // Create the iframe URL
    const url =
      `${METABASE_SITE_URL}/embed/dashboard/${token}#bordered=true&titled=true`;

    setIframeUrl(url);
  }, []);

  return (
    <iframe
      src={iframeUrl}
      frameBorder="0"
      width="800"
      height="600"
      style={{ border: "0", width: "100%", height: "600px" }}
    ></iframe>
  );
};

export default MetabaseDashboard;
