import { NextResponse, type NextRequest } from "next/server";
import { edgeAuth } from "@/infrastructure/auth/auth.edge";

const protectedRoutes: Record<string, string[]> = {
  "/fotografo": ["photographer", "admin"],
  "/admin": ["admin"],
  "/cliente": ["client", "photographer", "admin"],
};

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  response.headers.set("x-pathname", request.nextUrl.pathname);
  const session = await edgeAuth();
  const { pathname } = request.nextUrl;

  for (const [route, roles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      if (!session?.user) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }

      const isOnboarding = pathname.startsWith("/fotografo/onboarding");

      if (isOnboarding) continue;

      if (!roles.includes(session.user.role)) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
