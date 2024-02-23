/**
 * Replaces symbolic characters in a string with corresponding key-based placeholders.
 *
 * @param str - The input string.
 * @param key - The key used for generating placeholders.
 * @returns The string with symbolic characters replaced by placeholders.
 * @throws Error if key is not provided.
 */
export function replaceSymbolicCharacter(str: string, key: string): string {
  if (!key) throw new Error('key is required');
  return str
    .replace(/&/g, `!${key}A!`)
    .replace(/@/g, `!${key}B!`)
    .replace(/:/g, `!${key}C!`)
    .replace(/,/g, `!${key}D!`)
    .replace(/#/g, `!${key}E!`)
    .replace(/\$/g, `!${key}F!`)
    .replace(/"/g, `!${key}G!`)
    .replace(/=/g, `!${key}H!`)
    .replace(/\./g, `!${key}I!`)
    .replace(/>/g, `!${key}J!`)
    .replace(/`/g, `!${key}K!`)
    .replace(/\[/g, `!${key}L!`)
    .replace(/</g, `!${key}M!`)
    .replace(/\{/g, `!${key}N!`)
    .replace(/%/g, `!${key}O!`)
    .replace(/\+/g, `!${key}P!`)
    .replace(/\?/g, `!${key}Q!`)
    .replace(/\]/g, `!${key}R!`)
    .replace(/\}/g, `!${key}S!`)
    .replace(/'/g, `!${key}T!`)
    .replace(/;/g, `!${key}U!`)
    .replace(/\//g, `!${key}V!`)
    .replace(/\*/g, `!${key}W!`)
    .replace(/~/g, `!${key}X!`)
    .replace(/_/g, `!${key}Y!`)
    .replace(/\|/g, `!${key}Z!`)
    .replace(/\^/g, `!${key}1!`)
    .replace(/-/g, `!${key}2!`)
    .replace(/\\/g, ``);
}

/**
 * Reverses the replacement of symbolic characters in a string.
 *
 * @param str - The string to reverse the replacement.
 * @param key - The key used for replacement.
 * @returns The string with the symbolic characters reversed.
 * @throws Error if key is not provided.
 */
export function reverseReplaceSymbolicCharacter(str: string, key: string): string {
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
