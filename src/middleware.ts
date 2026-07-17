import { NextResponse, type NextRequest } from "next/server";
import { edgeAuth } from "@/infrastructure/auth/auth.edge";

const protectedRoutes: Record<string, string[]> = {
  "/fotografo": ["photographer", "admin"],
  "/admin": ["admin"],
  "/cliente": ["client", "photographer", "admin"],
};

function isProtectedPath(pathname: string): boolean {
  return Object.keys(protectedRoutes).some((route) => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);

  if (pathname.startsWith("/fotografo/onboarding")) {
    const target = pathname.includes("pendiente") ? "/fotografo" : "/ser-fotografx";
    return NextResponse.redirect(new URL(target, request.url));
  }

  // Rutas públicas: sin auth en el edge (evita JWT en cada navegación).
  if (!isProtectedPath(pathname)) {
    return response;
  }

  let session = null;
  try {
    session = await edgeAuth();
  } catch (error) {
    console.error("[middleware] auth:", error);
  }

  for (const [route, roles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      if (!session?.user) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }

      if (route === "/admin") {
        // El layout de admin valida el rol con datos frescos de Firestore.
        break;
      }

      if (route === "/fotografo") {
        if (session.user.role === "client") {
          // Solicitudes pendientes o aprobadas: el layout valida el acceso al panel.
          break;
        }

        if (!roles.includes(session.user.role)) {
          return NextResponse.redirect(new URL("/", request.url));
        }

        break;
      }

      if (!roles.includes(session.user.role)) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/media|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
