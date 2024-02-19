export default function removePseudoClasses(str: string) {
  return str.replace(
    /:(hover|focus|active|visited|link|target|empty|checked|enabled|disabled|valid|invalid|in-range|out-of-range|required|optional|read-only|read-write|placeholder-shown|default|root|nth-child|nth-last-child|first-child|last-child|only-child|first-of-type|last-of-type|only-of-type|nth-of-type|nth-last-of-type|last-of-type|first-of-type|only-of-type|nth-of-type|nth-last-of-type|lang|not|matches|any|dir|scope|local-link|local-link-active|local-link-target|local-link-pseudo|local-link-pseudo-active|local-link-pseudo-target|local-link-pseudo-visited|local-link-pseudo-visited-active|local-link-pseudo-visited)$/,
    ''
  );
}
