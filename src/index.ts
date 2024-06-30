import fs from 'node:fs';
import path from 'node:path';
import { getFiles, saveFile, loadFile } from './utils/fileUtils';
import createHash from './utils/createHash';
import { replaceSymbolicCharacter, reverseReplaceSymbolicCharacter } from './utils/symbolicCharacterReplacer';
import { removePseudoClasses, addPseudoClasses } from './utils/pseudoClasses';
import { Options, Regexeshtml } from './types';

const pluginName = 'postcss-classname-obfuscator';
const key = createHash('sha256', pluginName, 5); // 5 characters
const maxLength = 16;

const defaultOptions: Options = {
  type: 'nextjs',
  enable: true,
  length: 6,
  method: 'random',
  prefix: '',
  suffix: '',
  ignore: [],
  output: '',
  inspect: false,
  directory: '',
  inputJson: '',
  ignoreRegex: [],
  hashAlgorithm: 'sha256',
  outputBuildID: false,
  inspectDirectory: { input: '', output: '' },
  preRun: () => Promise.resolve(),
  callback: () => {},
};

const validateOptions = (options: Options) => {
  if (options.length! > maxLength) {
    throw new Error(`Length must be less than or equal to ${maxLength}`);
  }
};

const prepareIgnoreList = (ignore: string[]) => {
  return ignore.map((item) => (item.startsWith('.') ? item : `.${item}`));
};

const compileRegexes = (mapping: { [key: string]: string }, key: string): Regexeshtml[] => {
  return Object.keys(mapping).map((original) => {
    let str = original.slice(1).replace(/::after|::before/g, '');
    str = removePseudoClasses(str);
    return {
      regex: new RegExp(
        `(class=|className:\\s*)(['"]|[^,]+\\s)(${replaceSymbolicCharacter(str, key)})(\\s[^,]+|['"])`,
        'g'
      ),
      hashForCss: mapping[original],
      hashForHTML: removePseudoClasses(mapping[original].slice(1)),
    };
  });
};

const replaceClassNames = (content: string, regexeshtml: Regexeshtml[], key: string) => {
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

  return newContent.replace(contentRegex, (_match, p1, p2, p3, p4) => {
    return (p1 + p2 + reverseReplaceSymbolicCharacter(p3, key) + p4).replace('s*', '\\s*');
  });
};

const processFiles = async (
  files: string[],
  regexeshtml: Regexeshtml[],
  key: string,
  inspectFileMode: boolean,
  outputBuildID: boolean
) => {
  for (const file of files) {
    try {
      let content = fs.readFileSync(file, 'utf8');
      const newContent = replaceClassNames(content, regexeshtml, key);
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
  }

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
};

const plugin = (opt: Options = {}) => {
  return {
    postcssPlugin: pluginName,
    async Once(root: any) {
      const options = { ...defaultOptions, ...opt };
      validateOptions(options);

      let mapping: { [key: string]: string } = options.inputJson ? loadFile(options.inputJson) : {};
      const ignoreList = prepareIgnoreList(options.ignore!);
      await options.preRun!();

      root.walkRules((rule: any) => {
        if (
          options.enable &&
          rule.selector.startsWith('.') &&
          !ignoreList.includes(rule.selector) &&
          !options.ignoreRegex!.some((regex) => new RegExp(regex).test(rule.selector))
        ) {
          const hashLength = options.length! - options.prefix!.length - options.suffix!.length;

          if (options.method === 'random') {
            if (!mapping.hasOwnProperty(rule.selector)) {
              let hash;
              do {
                hash = createHash(options.hashAlgorithm!, rule.selector, hashLength);
              } while (
                Object.values(mapping).includes(`.${options.prefix! + hash + options.suffix!}`) ||
                /^\d/.test(hash)
              );

              const pseudoElements = addPseudoClasses(rule.selector);
              mapping[rule.selector] =
                `.${options.prefix! + hash + options.suffix!}${pseudoElements.join('')}`;

              if (options.inspect) {
                console.log(`[${pluginName}] ${rule.selector} -> ${mapping[rule.selector]}`);
              }
            }
          } else {
            mapping[rule.selector] = `.${options.prefix! + rule.selector.substring(2) + options.suffix!}`;
          }
          rule.selector = mapping[rule.selector];
        }
      });

      if (options.output) saveFile(options.output, mapping);

      const regexeshtml = compileRegexes(mapping, key);

      root.walkRules((rule: any) => {
        for (const { regex, hashForCss } of regexeshtml) {
          if (regex.test(rule.selector)) {
            rule.selector = rule.selector.replace(regex, hashForCss);
          }
        }
      });

      const directoryPath = options.directory
        ? path.join(process.cwd(), options.directory)
        : path.join(process.cwd(), options.type === 'nextjs' ? '.next/server' : 'src');

      if (fs.existsSync(directoryPath)) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const files = await getFiles(directoryPath);
        if (options.inspect) console.log(files);
        await processFiles(
          files,
          regexeshtml,
          key,
          Boolean(options.inspectDirectory.input && options.inspectDirectory.output),
          options.outputBuildID
        );
      }

      if (options.inspect) {
        console.log(mapping);
      }

      options.callback!();
    },
  };
};

plugin.postcss = true;
export = plugin;
