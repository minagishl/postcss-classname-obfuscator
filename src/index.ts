import { createHash } from 'crypto';
import fs from 'node:fs';
import path from 'node:path';

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
  preRun?: () => Promise<void>;
  callback?: () => void;
};

async function getFiles(dirPath: string, result: string[] = []) {
  try {
    const files = await fs.promises.readdir(dirPath, { withFileTypes: true });
    for (const file of files) {
      const filePath = path.join(dirPath, file.name);
      if (file.isDirectory()) {
        await getFiles(filePath, result);
      } else if (!/\.css$/.test(filePath)) {
        result.push(filePath);
      }
    }
    return result;
  } catch (err: any) {
    console.error(err);
    return [];
  }
}

const plugin = (opt: any = {}) => {
  return {
    postcssPlugin: 'postcss-classname-obfuscator',
    Once(root: any) {
      const mapping: { [key: string]: string } = {};
      const options: Options = opt;

      // Options
      const type = options.type || '';
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
      const preRun = options.preRun || (() => Promise.resolve());
      const callback = options.callback || function () {};

      // Validate options
      if (length > 64) {
        throw new Error('Length must be less than or equal to 64');
      }

      // Generate random integer
      function getRandomInt(max: number) {
        return Math.floor(Math.random() * max);
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
          !rule.selector.startsWith(':') &&
          !rule.selector.startsWith('*') &&
          enable &&
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
                hash = createHash('sha256')
                  .update(rule.selector + getRandomInt(100))
                  .digest('hex')
                  .slice(0, hashLength);
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
        regex: new RegExp(`(?<=['"\\s])${original.slice(1)}(?=['"\\s])`, 'g'),
        hash: mapping[original as keyof typeof mapping],
      }));

      // Second pass: replace class names
      root.walkRules(async (rule: any) => {
        for (const { regex, hash } of regexes) {
          if (regex.test(rule.selector)) {
            rule.selector = rule.selector.replace(regex, hash.slice(1));
          }

          if (!directory && !type) return;
          let directoryPath = path.join(process.cwd(), directory || (type === 'nextjs' ? '.next' : 'src'));
          // Replace the class name here.
          if (fs.existsSync(directoryPath)) {
            let files = await getFiles(directoryPath);

            // inspect
            if (inspect) {
              console.log(files);
            }

            files.forEach((file) => {
              let content = fs.readFileSync(file, 'utf8');

              for (const { regex, hash } of regexes) {
                // inspect
                if (inspect) {
                  console.log(content, regex, hash);
                }

                // Remove the dot from the hash.
                const newHash = hash.startsWith('.') ? hash.slice(1) : hash;
                // Replace the dot from the regex.
                const newRegex = new RegExp(regex.source.replace('\\..', ''), 'g');
                content = content.replace(newRegex, newHash);
              }

              fs.writeFileSync(file, content, 'utf8');
            });
          }
        }
      });

      if (inspect) {
        console.log(mapping);
      }

      callback();
    },
  };
};

plugin.postcss = true;
export = plugin;
