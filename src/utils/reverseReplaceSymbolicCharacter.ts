/**
 * Reverses the replacement of symbolic characters in a string.
 *
 * @param str - The string to reverse the replacement.
 * @param key - The key used for replacement.
 * @returns The string with the symbolic characters reversed.
 * @throws Error if key is not provided.
 */
export default function reverseReplaceSymbolicCharacter(str: string, key: string): string {
  if (!key) throw new Error('key is required');
  return str
    .replace(new RegExp(`!${key}A!`, 'g'), '&')
    .replace(new RegExp(`!${key}B!`, 'g'), '@')
    .replace(new RegExp(`!${key}C!`, 'g'), ':')
    .replace(new RegExp(`!${key}D!`, 'g'), ',')
    .replace(new RegExp(`!${key}E!`, 'g'), '#')
    .replace(new RegExp(`!${key}F!`, 'g'), '$')
    .replace(new RegExp(`!${key}G!`, 'g'), '"')
    .replace(new RegExp(`!${key}H!`, 'g'), '=')
    .replace(new RegExp(`!${key}I!`, 'g'), '.')
    .replace(new RegExp(`!${key}J!`, 'g'), '>')
    .replace(new RegExp(`!${key}K!`, 'g'), '`')
    .replace(new RegExp(`!${key}L!`, 'g'), '[')
    .replace(new RegExp(`!${key}M!`, 'g'), '<')
    .replace(new RegExp(`!${key}N!`, 'g'), '{')
    .replace(new RegExp(`!${key}O!`, 'g'), '%')
    .replace(new RegExp(`!${key}P!`, 'g'), '+')
    .replace(new RegExp(`!${key}Q!`, 'g'), '?')
    .replace(new RegExp(`!${key}R!`, 'g'), ']')
    .replace(new RegExp(`!${key}S!`, 'g'), '}')
    .replace(new RegExp(`!${key}T!`, 'g'), "'")
    .replace(new RegExp(`!${key}U!`, 'g'), ';')
    .replace(new RegExp(`!${key}V!`, 'g'), '/')
    .replace(new RegExp(`!${key}W!`, 'g'), '*')
    .replace(new RegExp(`!${key}X!`, 'g'), '~')
    .replace(new RegExp(`!${key}Y!`, 'g'), '_')
    .replace(new RegExp(`!${key}Z!`, 'g'), '|')
    .replace(new RegExp(`!${key}1!`, 'g'), '^')
    .replace(new RegExp(`!${key}2!`, 'g'), '-');
}
