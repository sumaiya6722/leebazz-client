const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const sessionCookieNames = new Set([
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
]);

async function proxyBackendRequest(request, context) {
  const { path } = await context.params;
  if (!path.length || path[0] !== "api" || path.some((segment) => segment === "." || segment === "..")) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  const backendPath = path.map((segment) => encodeURIComponent(segment)).join("/");
  const backendUrl = new URL(
    `${backendPath}${request.nextUrl.search}`,
    `${API_BASE_URL.replace(/\/+$/, "")}/`,
  );
  const headers = new Headers();

  for (const headerName of ["accept", "content-type"]) {
    const headerValue = request.headers.get(headerName);
    if (headerValue) headers.set(headerName, headerValue);
  }
  const sessionCookies = request.headers.get("cookie")
    ?.split(";")
    .map((cookie) => cookie.trim())
    .filter((cookie) => sessionCookieNames.has(cookie.slice(0, cookie.indexOf("="))))
    .join("; ");
  if (sessionCookies) headers.set("cookie", sessionCookies);

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  const backendResponse = await fetch(backendUrl, {
    method: request.method,
    headers,
    ...(hasBody ? { body: await request.arrayBuffer() } : {}),
    cache: "no-store",
  });
  const responseHeaders = new Headers({
    "cache-control": "no-store",
  });
  const contentType = backendResponse.headers.get("content-type");
  if (contentType) responseHeaders.set("content-type", contentType);

  const body = [204, 304].includes(backendResponse.status)
    ? null
    : await backendResponse.arrayBuffer();
  return new Response(body, {
    status: backendResponse.status,
    headers: responseHeaders,
  });
}

export const GET = proxyBackendRequest;
export const POST = proxyBackendRequest;
export const PATCH = proxyBackendRequest;
export const DELETE = proxyBackendRequest;
