/**
 * Replaces symbolic characters in a string with corresponding key-based placeholders.
 *
 * @param str - The input string.
 * @param key - The key used for generating placeholders.
 * @returns The string with symbolic characters replaced by placeholders.
 * @throws Error if key is not provided.
 */
export default function replaceSymbolicCharacter(str: string, key: string): string {
  if (!key) throw new Error('key is required');
  return str
    .replace(/&/g, `!${key}A!`)
    .replace(/@/g, `!${key}B!`)
    .replace(/\\/g, `!${key}C!`)
    .replace(/:/g, `!${key}D!`)
    .replace(/,/g, `!${key}E!`)
    .replace(/#/g, `!${key}F!`)
    .replace(/\$/g, `!${key}G!`)
    .replace(/"/g, `!${key}H!`)
    .replace(/=/g, `!${key}I!`)
    .replace(/\./g, `!${key}J!`)
    .replace(/>/g, `!${key}K!`)
    .replace(/`/g, `!${key}L!`)
    .replace(/\[/g, `!${key}M!`)
    .replace(/</g, `!${key}N!`)
    .replace(/\{/g, `!${key}O!`)
    .replace(/%/g, `!${key}P!`)
    .replace(/\+/g, `!${key}Q!`)
    .replace(/\?/g, `!${key}R!`)
    .replace(/\]/g, `!${key}S!`)
    .replace(/\}/g, `!${key}T!`)
    .replace(/'/g, `!${key}U!`)
    .replace(/;/g, `!${key}V!`)
    .replace(/\//g, `!${key}W!`)
    .replace(/\*/g, `!${key}X!`)
    .replace(/~/g, `!${key}Y!`)
    .replace(/_/g, `!${key}Z!`)
    .replace(/\|/g, `!${key}1!`)
    .replace(/\^/g, `!${key}2!`)
    .replace(/-/g, `!${key}3!`);
}
