"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Store } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function AdminHeaderActions({ displayName, image }) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState("");
  const [imageFailed, setImageFailed] = useState(false);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    setError("");

    try {
      const result = await authClient.signOut();
      if (result?.error) throw new Error(result.error.message || "Sign out failed");
      router.replace("/login");
      router.refresh();
    } catch (signOutError) {
      console.error("Admin sign out failed.", signOutError);
      setError("Could not log out. Please try again.");
      setSigningOut(false);
    }
  }

  return (
    <div className="admin-header-actions">
      <a href="/" className="admin-header-store-link">
        <Store size={14} aria-hidden="true" />
        <span>View storefront</span>
      </a>
      <span
        className="admin-avatar"
        aria-label={`${displayName}'s profile image`}
        style={{
          position: "relative",
          display: "grid",
          width: 36,
          height: 36,
          minWidth: 36,
          maxWidth: 36,
          flex: "0 0 36px",
          overflow: "hidden",
          borderRadius: "50%",
        }}
      >
        {image && !imageFailed ? (
          <img
            src={image}
            alt=""
            onError={() => setImageFailed(true)}
            style={{ position: "absolute", inset: 0, display: "block", width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span aria-hidden="true">{displayName?.trim()?.charAt(0)?.toUpperCase() || "A"}</span>
        )}
      </span>
      <span className="admin-user-name">{displayName}</span>
      <button
        className="admin-logout-button"
        type="button"
        onClick={handleSignOut}
        disabled={signingOut}
      >
        <LogOut size={14} aria-hidden="true" />
        {signingOut ? "Signing out…" : "Log out"}
      </button>
      {error && <span className="admin-logout-error" role="alert">{error}</span>}
    </div>
  );
}
