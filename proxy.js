import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-dev';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function proxy(request) {
  const token = request.cookies.get('auth-token')?.value;
  let user = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, secretKey);
      user = payload;
    } catch (err) {
      // Invalid token
    }
  }

  const { pathname } = request.nextUrl;

  function redirect(targetPathname, searchParams) {
    const url = request.nextUrl.clone();
    url.pathname = targetPathname;
    url.search = "";
    if (searchParams) {
      Object.entries(searchParams).forEach(([key, val]) =>
        url.searchParams.set(key, val)
      );
    }
    return NextResponse.redirect(url);
  }

  function json(body, init) {
    return NextResponse.json(body, init);
  }

  // ---------------------------------------------------
  // Protect admin UI pages: /admin, /admin/*
  // ---------------------------------------------------
  if (pathname.startsWith("/admin")) {
    if (!user) {
      return redirect("/login", { redirect: pathname });
    }

    if (user.role !== "admin") {
      return redirect("/");
    }
  }

  // ---------------------------------------------------
  // Protect admin API routes: /api/*/admin/*
  // ---------------------------------------------------
  if (pathname.includes("/admin/") && pathname.startsWith("/api/")) {
    if (!user) {
      return json({ error: "Authentication required" }, { status: 401 });
    }

    if (user.role !== "admin") {
      return json({ error: "Admin access required" }, { status: 403 });
    }
  }

  // ---------------------------------------------------
  // Protect authenticated-only API routes
  // ---------------------------------------------------
  if (
    pathname.startsWith("/api/orders/") ||
    pathname.match(/\/api\/notes\/[^/]+\/download/)
  ) {
    if (!user) {
      return json({ error: "Authentication required" }, { status: 401 });
    }
  }

  // ---------------------------------------------------
  // Protect /profile page (must be logged in)
  // ---------------------------------------------------
  if (pathname === "/profile") {
    if (!user) {
      return redirect("/login", { redirect: "/profile" });
    }
  }

  // ---------------------------------------------------
  // Redirect logged-in users away from /login and /signup
  // ---------------------------------------------------
  if ((pathname === "/login" || pathname === "/signup") && user) {
    return redirect(user.role === "admin" ? "/admin" : "/");
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
