import Link from "next/link";

export function AdminAccessState({ signedIn = false, unavailable = false }) {
  const title = unavailable
    ? "We couldn’t verify your access"
    : signedIn
      ? "Admin access required"
      : "Sign in to continue";
  const message = unavailable
    ? "The sign-in service could not confirm your session right now. Please try again shortly."
    : signedIn
      ? "This account does not have administrator access. Ask the site owner if you believe this is a mistake."
      : "Sign in with an administrator account to open the dashboard.";

  return (
    <main className="admin-access-page">
      <section className="admin-access-card" aria-labelledby="admin-access-title">
        <span className="eyebrow">LEEBAZZ ADMIN</span>
        <h1 id="admin-access-title">{title}</h1>
        <p>{message}</p>
        <Link className="button button-dark" href={unavailable ? "/admin" : signedIn ? "/" : "/login"}>
          {unavailable ? "Try again" : signedIn ? "Return to Leebazz" : "Go to sign in"}
        </Link>
      </section>
    </main>
  );
}
