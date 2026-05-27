import React from "react";
import { useAuth } from "../../context/AuthContext";

export default function IsPlatformAdmin({ children, fallback = null }) {
  const { isPlatformAdmin } = useAuth();

  if (!isPlatformAdmin) {
    return fallback;
  }

  return children;
}
