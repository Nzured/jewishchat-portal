export function getActiveHref(pathname: string, hrefs: string[]) {
  return hrefs
    .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
    .reduce<
      string | undefined
    >((best, href) => (best === undefined || href.length > best.length ? href : best), undefined);
}
