import fs from 'fs';
import path from 'path';

/**
 * Recursively retrieves all files in a directory, excluding certain file types and directories.
 * @param dirPath - The path to the directory.
 * @param result - An array to store the file paths. (Optional)
 * @returns A promise that resolves to an array of file paths.
 */
export async function getFiles(dirPath: string, result: string[] = []) {
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

/**
 * Saves the mapping object as a JSON file at the specified output path.
 * If the output path does not end with '.json', it appends '/main.json' to the path.
 * If the directory of the output path does not exist, it creates the directory.
 *
 * @param output - The output path where the JSON file will be saved.
 * @param mapping - The mapping object to be saved as a JSON file.
 */
export function saveFile(output: string, mapping: Record<string, string>): void {
  let outputPath = path.join(process.cwd(), output);

  // Check if outputPath ends with a .json file
  if (!path.basename(outputPath).endsWith('.json')) {
    // If outputPath ends with '/', append 'main.json'. Otherwise, append '/main.json'
    outputPath += outputPath.endsWith('/') ? 'main.json' : '/main.json';
  }

  // Get the directory of outputPath
  const dir = path.dirname(outputPath);

  // If the directory does not exist, create it
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const sortedMapping: Record<string, string> = Object.keys(mapping)
    .sort()
    .reduce((obj: Record<string, string>, key: string) => {
      obj[key] = mapping[key];
      return obj;
    }, {});

  fs.writeFile(outputPath, JSON.stringify(sortedMapping, null, 2), (err) => {
    if (err) throw err;
  });
}

/**
 * Loads a file and returns its content as a JSON object.
 * If the file does not exist, an empty object is returned.
 * @param filePath - The path to the file to be loaded.
 * @returns The content of the file as a JSON object.
 */
export function loadFile(filePath: string): Record<string, string> {
  let loadPath = path.join(process.cwd(), filePath);

  if (!path.basename(loadPath).endsWith('.json')) {
    loadPath += loadPath.endsWith('/') ? 'main.json' : '/main.json';
  }

  if (fs.existsSync(loadPath)) {
    const data = fs.readFileSync(loadPath, 'utf8');
    return JSON.parse(data);
  } else {
    return {};
  }
}
