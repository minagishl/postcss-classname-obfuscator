import fs from 'node:fs';
import path from 'node:path';
import createHash from './utils/createHash';
import replaceSymbolicCharacter from './utils/replaceSymbolicCharacter';
import reverseReplaceSymbolicCharacter from './utils/reverseReplaceSymbolicCharacter';

type Options = {
  type?: string;
  enable?: boolean;
  length?: number;
  method?: string;
  prefix?: string;
  suffix?: string;
  ignore?: string[];
  output?: string;
  inspect?: boolean; // No description in readme.md
  directory?: string;
  ignoreRegex?: string[];
  hashAlgorithm?: string;
  inspectDirectory?: inspectDirectory;
  preRun?: () => Promise<void>;
  callback?: () => void;
};

type inspectDirectory = {
  input: string;
  output: string;
};

const key = new Date().getTime().toString();

async function getFiles(dirPath: string, result: string[] = []) {
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

function replaceClass(regex: RegExp, str: string, hash: string) {
  // Change to hash value with new regular expression and replaced content
  const replacedStr = str.replace(regex, (_match, p1, p2, _p3, p4) => {
    return p1 + p2 + hash + p4;
  });

  return replacedStr;
}

const plugin = (opt: any = {}) => {
  return {
    postcssPlugin: 'postcss-classname-obfuscator',
    async Once(root: any) {
      const mapping: { [key: string]: string } = {};
      const options: Options = opt;

      // Options
      const type = options.type || 'nextjs';
      const enable = options.enable !== undefined ? options.enable : true;
      const length = options.length || 6;
      const method = options.method || 'random';
      const prefix = options.prefix || '';
      const suffix = options.suffix || '';
      const ignore = options.ignore || [];
      const output = options.output || '';
      const inspect = options.inspect || false;
      const directory = options.directory || '';
      const ignoreRegex = options.ignoreRegex || [];
      const hashAlgorithm = options.hashAlgorithm || 'sha256';
      const inspectDirectory = options.inspectDirectory || { input: '', output: '' };
      const preRun = options.preRun || (() => Promise.resolve());
      const callback = options.callback || function () {};

      // Validate options
      if (length > 32) {
        // Because it may not work correctly
        throw new Error('Length must be less than or equal to 32');
      }

      const validHashAlgorithms = ['md5', 'sha1', 'sha256', 'sha512'];

      if (!validHashAlgorithms.includes(hashAlgorithm)) {
        throw new Error(
          `Invalid hashAlgorithm: ${hashAlgorithm}. Must be one of ${validHashAlgorithms.join(', ')}`
        );
      }

      // Add '.' to ignore list
      for (let i = 0; i < ignore.length; i++) {
        if (!ignore[i].startsWith('.')) {
          ignore[i] = '.' + ignore[i];
        }
      }

      // Run preRun callback
      preRun();

      // First pass: collect custom properties and generate hashes
      root.walkRules((rule: any) => {
        if (
          enable &&
          rule.selector.startsWith('.') &&
          !ignore.includes(rule.selector) &&
          !ignoreRegex.some((regex) => new RegExp(regex).test(rule.selector))
        ) {
          // Length of hash characters
          const hashLength = length - prefix.length - suffix.length;

          // Hash method
          if (method === 'random') {
            if (!Object.prototype.hasOwnProperty.call(mapping, rule.selector)) {
              let hash;
              do {
                hash = createHash(hashAlgorithm, rule.selector, hashLength);
              } while (Object.values(mapping).includes(`.${prefix + hash + suffix}`) || /^\d/.test(hash));

              // Check if the selector has pseudo-elements or universal selector
              const pseudoElements = rule.selector.match(/::after|::before|\*/g) || [];
              mapping[rule.selector] = `.${prefix + hash + suffix}${pseudoElements.join('')}`;
            }
          } else {
            mapping[rule.selector] = '.' + prefix + rule.selector.substring(2) + suffix;
          }
          rule.selector = mapping[rule.selector];
        }
      });

      // Write mapping to file
      if (output) {
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

        fs.writeFile(outputPath, JSON.stringify(mapping, null, 2), (err) => {
          if (err) throw err;
        });
      }

      // Compile regular expressions outside of the loop
      const regexes = Object.keys(mapping).map((original) => ({
        regex: new RegExp(`.${original}`, 'g'),
        hash: mapping[original as keyof typeof mapping],
      }));

      const regexeshtml = Object.keys(mapping).map((original) => ({
        regex: new RegExp(
          `(class=|className:\\s)(['"]|['"].*\\s)(\\b${replaceSymbolicCharacter(original.slice(1), key)}\\b)(\\s.*['"]|['"])`,
          'g'
        ),
        hash: mapping[original as keyof typeof mapping],
      }));

      // Second pass: replace class names
      root.walkRules(async (rule: any) => {
        for (const { regex, hash } of regexes) {
          if (regex.test(rule.selector)) {
            rule.selector = rule.selector.replace(regex, hash.slice(1));
          }
        }
      });

      let directoryPath = '';
      let inspectFileMode = false;

      if (!directory && !type) return;
      if (inspectDirectory.input && inspectDirectory.output) {
        directoryPath = path.join(process.cwd(), inspectDirectory.input);
        inspectFileMode = true;
      } else {
        directoryPath = path.join(process.cwd(), directory || (type === 'nextjs' ? '.next/server' : 'src'));
      }
      // Replace the class name here.
      if (fs.existsSync(directoryPath)) {
        await new Promise((resolve) => {
          setTimeout(resolve, 5000);
        });

        let files = await getFiles(directoryPath);

        // inspect
        if (inspect) {
          console.log(files);
        }

        files.forEach((file) => {
          console.log(file);
          try {
            // regular expression
            let content = fs.readFileSync(file, 'utf8');
            const contentRegex = new RegExp(`(class=['"]|className:\\s*['"])(.*?)(['"])`, 'g');
            content = content.replace(contentRegex, (_match, p1, p2, p3) => {
              return (p1 + replaceSymbolicCharacter(p2, key) + p3).replace('s*', '\\s*');
            });

            let newContent = content;

            for (const { regex, hash } of regexeshtml) {
              // inspect
              if (inspect) {
                console.log(newContent, regex, hash);
              }

              newContent = replaceClass(regex, newContent, hash.slice(1));
            }

            newContent = reverseReplaceSymbolicCharacter(newContent, key);

            if (inspectFileMode) {
              const outputFileName = 'output-' + path.basename(file);
              const outputPath = path.join(path.dirname(file), outputFileName);
              fs.writeFileSync(outputPath, newContent, 'utf8');
            } else {
              fs.writeFileSync(file, newContent, 'utf8');
            }
          } catch (error) {
            console.error(`Error processing file: ${file}`);
            console.error(error);
          }
        });
      }

      if (inspect) {
        console.log(mapping);
      }

      callback();
    },
  };
};

plugin.postcss = true;
export = plugin;
