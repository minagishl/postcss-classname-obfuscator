import fs from 'fs';
import path from 'path';

/**
 * Recursively retrieves all files in a directory, excluding certain file types and directories.
 * @param dirPath - The path to the directory.
 * @param result - An array to store the file paths. (Optional)
 * @returns A promise that resolves to an array of file paths.
 */
export default async function getFiles(dirPath: string, result: string[] = []) {
  try {
    const files = await fs.promises.readdir(dirPath, { withFileTypes: true });
    for (const file of files) {
      const filePath = path.join(dirPath, file.name);
      if (file.isDirectory()) {
        if (file.name !== 'favicon.ico' && file.name !== 'chunks') {
          return getFiles(filePath);
        }
      } else if (!/\.(css|json)$/.test(filePath) && !filePath.includes('output')) {
        result.push(filePath);
      }
    }
    return result;
  } catch (err: any) {
    console.error(err);
    return [];
  }
}
