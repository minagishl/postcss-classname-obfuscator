import fs from 'node:fs';
import path from 'node:path';
import getFiles from './utils/getFiles';
import createHash from './utils/createHash';
import replaceSymbolicCharacter from './utils/replaceSymbolicCharacter';
import reverseReplaceSymbolicCharacter from './utils/reverseReplaceSymbolicCharacter';
import { removePseudoClasses, addPseudoClasses } from './utils/pseudoClasses';
import { Options, Regexeshtml } from './types';

const pluginName = 'postcss-classname-obfuscator';
const key = createHash('sha256', pluginName, 5); // 5 characters

const plugin = (opt: any = {}) => {
  return {
    postcssPlugin: pluginName,
    async Once(root: any) {
      // mapping contains classes for css
      const mapping: { [key: string]: string } = {};
      const options: Options = opt;
      const maxLength: number = 16;

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
      const outputBuildID = options.outputBuildID || false;
      const inspectDirectory = options.inspectDirectory || { input: '', output: '' };
      const preRun = options.preRun || (() => Promise.resolve());
      const callback = options.callback || function () {};

      // Validate options
      if (length > maxLength) {
        // Because it may not work correctly
        throw new Error(`Length must be less than or equal to ${maxLength}`);
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

              const pseudoElements = addPseudoClasses(rule.selector);
              mapping[rule.selector] = `.${prefix + hash + suffix}${pseudoElements.join('')}`;

              // For development confirmation
              if (inspect) {
                console.log(`[${pluginName}] ${rule.selector} -> ${mapping[rule.selector]}`);
              }
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
        regex: new RegExp(`${original}`, 'g'),
        hash: mapping[original as keyof typeof mapping],
      }));

      const regexeshtml = Object.keys(mapping).map((original) => {
        let str = original.slice(1).replace(/::after|::before/g, '');
        str = removePseudoClasses(str);
        return {
          regex: new RegExp(
            `(class=|className:\\s*)(['"]|[^,]+\\s)(${replaceSymbolicCharacter(str, key)})(\\s[^,]+|['"])`,
            'g'
          ),
          hashForCss: mapping[original as keyof typeof mapping],
          hashForHTML: removePseudoClasses(mapping[original as keyof typeof mapping].slice(1)),
        };
      }) as Regexeshtml[];

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
          setTimeout(resolve, 500); // Error Countermeasures
        });

        let files = await getFiles(directoryPath);

        // inspect
        if (inspect) {
          console.log(files);
        }

        files.forEach((file) => {
          try {
            // regular expression
            let content = fs.readFileSync(file, 'utf8');
            const contentRegex = new RegExp(`(class=|className:\\s*)(['"])(.*?)(\\2)`, 'g');
            content = content.replace(contentRegex, (_match, p1, p2, p3, p4) => {
              return (p1 + p2 + replaceSymbolicCharacter(p3, key) + p4).replace('s*', '\\s*');
            });

            let newContent = content;

            for (const { regex, hashForHTML } of regexeshtml) {
              newContent = newContent.replace(regex, (_match, p1, p2, _p3, p4) => {
                return p1 + p2 + hashForHTML + p4;
              });
            }

            newContent = newContent.replace(contentRegex, (_match, p1, p2, p3, p4) => {
              return (p1 + p2 + reverseReplaceSymbolicCharacter(p3, key) + p4).replace('s*', '\\s*');
            });

            if (inspectFileMode) {
              const outputFileName = 'output-' + path.basename(file);
              const outputPath = path.join(path.dirname(file), outputFileName);
              fs.writeFileSync(outputPath, newContent, 'utf8');
            } else {
              fs.writeFile(file, newContent, 'utf8', (err) => {
                if (err) throw err;
              });
            }
          } catch (error) {
            console.error(`Error processing file: ${file}`);
            console.error(error);
          }
        });

        // inspect
        if (outputBuildID) {
          const buildID = path.join(process.cwd(), '/BUILD_ID');
          const dir = path.dirname(buildID);

          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }

          fs.writeFile(buildID, JSON.stringify({ name: pluginName, id: key }), (err) => {
            if (err) throw err;
          });
        }
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
