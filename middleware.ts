import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import {
  getAcademyOrigin,
  getCompanyOrigin,
  getKitaplikOrigin,
  getShopOrigin,
  getWordPressOrigin,
  isCompanyAllowedPath,
  isCompanyRedirectToAcademyPath,
  isCompanyRedirectToWordPressPath,
  isCompanySiteHost,
  isKitaplikAllowedPath,
  isKitaplikSiteHost,
  isShopAllowedPath,
  isShopSiteHost,
} from "@/lib/site/site-mode";

function redirectToAcademy(request: NextRequest) {
  const destination = new URL(
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
    getAcademyOrigin(),
  );
  return NextResponse.redirect(destination);
}

function redirectToWordPress(request: NextRequest) {
  const destination = new URL(
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
    getWordPressOrigin(),
  );
  return NextResponse.redirect(destination);
}

function redirectToCompanyHome() {
  return NextResponse.redirect(new URL("/", getCompanyOrigin()));
}

function redirectToShopHome() {
  return NextResponse.redirect(new URL("/", getShopOrigin()));
}

function redirectToKitaplikHome() {
  return NextResponse.redirect(new URL("/", getKitaplikOrigin()));
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host");
  const { pathname } = request.nextUrl;

  if (isKitaplikSiteHost(host)) {
    if (isCompanyRedirectToAcademyPath(pathname)) {
      return redirectToAcademy(request);
    }

    if (!isKitaplikAllowedPath(pathname)) {
      return redirectToKitaplikHome();
    }
  }

  if (isShopSiteHost(host)) {
    if (isCompanyRedirectToAcademyPath(pathname)) {
      return redirectToAcademy(request);
    }

    if (!isShopAllowedPath(pathname)) {
      return redirectToShopHome();
    }
  }

  if (isCompanySiteHost(host)) {
    if (isCompanyRedirectToWordPressPath(pathname)) {
      return redirectToWordPress(request);
    }

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
