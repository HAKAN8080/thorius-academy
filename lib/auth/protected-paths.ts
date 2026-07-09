/** Oturum gerektiren Academy uygulama yolları. */
export function isProtectedAppPath(pathname: string): boolean {
  return (
    pathname === "/panel" ||
    pathname.startsWith("/panel/") ||
    pathname === "/instructor" ||
    pathname.startsWith("/instructor/")
  );
}

export function buildLoginRedirectPath(pathname: string, search = ""): string {
  const target = `${pathname}${search}`;
  return `/giris?redirect=${encodeURIComponent(target)}`;
}
