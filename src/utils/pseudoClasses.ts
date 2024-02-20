const pseudoClassesPattern =
  /:(after|before|hover|focus|active|visited|link|target|empty|checked|enabled|disabled|valid|invalid|in-range|out-of-range|required|optional|read-only|read-write|placeholder-shown|default|root|nth-child|nth-last-child|first-child|last-child|only-child|first-of-type|last-of-type|only-of-type|nth-of-type|nth-last-of-type|last-of-type|first-of-type|only-of-type|nth-of-type|nth-last-of-type|lang|not|matches|any|dir|scope|local-link|local-link-active|local-link-target|local-link-pseudo|local-link-pseudo-active|local-link-pseudo-target|local-link-pseudo-visited|local-link-pseudo-visited-active|local-link-pseudo-visited)$/g;

/**
 * Removes pseudo classes from a string.
 * @param str - The string to remove pseudo classes from.
 * @returns The string with pseudo classes removed.
 */
export function removePseudoClasses(str: string) {
  return str.replace(pseudoClassesPattern, '');
}

/**x
 * Adds pseudo classes to a string.
 * @param str - The input string.
 * @returns An array of matched pseudo classes.
 */
export function addPseudoClasses(str: string) {
  return str.match(pseudoClassesPattern) || [];
}
