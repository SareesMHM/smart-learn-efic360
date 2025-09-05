// src/pages/Logout.jsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

function deleteCookie(name) {
  document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
}

function clearClientAuth() {
  // Local/session storage
  try {
    localStorage.removeItem("authUser");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.clear();
  } catch {}

  // Common cookie names you might be using
  ["token", "accessToken", "refreshToken", "jwt", "JWT"].forEach(deleteCookie);

  // Remove axios auth header if set
  if (axios?.defaults?.headers?.common?.Authorization) {
    delete axios.defaults.headers.common.Authorization;
  }
}

export default function Logout() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const returnTo = new URLSearchParams(search).get("to") || "/login";

  useEffect(() => {
    let done = false;

    const run = async () => {
      try {
        // Optional: call your API to invalidate refresh token/server session
        // Adjust the URL to match your backend (examples below).
        // await axios.post("/api/auth/logout", {}, { withCredentials: true });
        // or:
        // await axios.post("/api/logout", {}, { withCredentials: true });
      } catch {
        // Even if server call fails, still clear client state
      } finally {
        if (!done) {
          clearClientAuth();
          navigate(returnTo, { replace: true });
        }
      }
    };

    run();
    return () => { done = true; };
  }, [navigate, returnTo]);

  return (
    <main className="app-main logout-page" aria-busy="true">
      <div className="page-head">
        <h1>Signing you out…</h1>
        <p className="muted">Please wait a moment.</p>
      </div>
      {/* Optional: add a spinner styled by your SCSS */}
      <div className="spinner" aria-hidden="true" />
    </main>
  );
}
