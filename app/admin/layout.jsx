import { Suspense } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminAccessState } from "@/components/admin-access-state";
import { AdminHeaderActions } from "@/components/admin-header-actions";

// Session checks use request headers and cannot be prerendered into a static shell.
export const instant = false;

async function ProtectedAdminArea({ children }) {
  let session;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch (error) {
    console.error("Admin session verification failed.", error);
    return <AdminAccessState unavailable />;
  }

  if (!session) return <AdminAccessState />;
  if (session.user?.role !== "admin") return <AdminAccessState signedIn />;

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main-column">
        <header className="admin-topbar">
          <span>LEEBAZZ / ADMIN</span>
          <AdminHeaderActions
            displayName={session.user.name || session.user.email}
            image={session.user.image}
          />
        </header>
        {children}
      </div>
    </div>
  );
}

function AdminLoading() {
  return (
    <div className="admin-access-page" role="status">
      <p>Checking administrator access…</p>
    </div>
  );
}

export default function AdminLayout({ children }) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <ProtectedAdminArea>{children}</ProtectedAdminArea>
    </Suspense>
  );
}
