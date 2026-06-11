import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import {
  getAcademyOrigin,
  getCompanyOrigin,
  isCompanyAllowedPath,
  isCompanyRedirectToAcademyPath,
  isCompanySiteHost,
} from "@/lib/site/site-mode";

function redirectToAcademy(request: NextRequest) {
  const destination = new URL(
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
    getAcademyOrigin(),
  );
  return NextResponse.redirect(destination);
}

function redirectToCompanyHome() {
  return NextResponse.redirect(new URL("/", getCompanyOrigin()));
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host");
  const { pathname } = request.nextUrl;

  if (isCompanySiteHost(host)) {
    if (isCompanyRedirectToAcademyPath(pathname)) {
      return redirectToAcademy(request);
    }

    if (!isCompanyAllowedPath(pathname)) {
      return redirectToCompanyHome();
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
