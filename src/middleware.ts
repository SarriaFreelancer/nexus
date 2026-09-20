import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Return NextResponse.next() to continue the request
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth endpoints)
     * - api/pusher (Pusher auth endpoints)
     * - login (login page)
     * - register (register page)
     * - service-worker.js (Pusher service worker)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - static assets with extensions (.svg, .png, .jpg, .jpeg, .gif, .webp, .ico, .js)
     */
    "/((?!api/auth|api/pusher|login|register|service-worker.js|_next/static|_next/image|favicon.ico|$|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js)$).*)",
  ],
};
