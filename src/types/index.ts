export type Options = {
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
  outputBuildID?: boolean; // No description in readme.md
  inspectDirectory?: inspectDirectory;
  preRun?: () => Promise<void>;
  callback?: () => void;
};

type inspectDirectory = {
  input: string;
  output: string;
};

export type Regexeshtml = {
  regex: RegExp;
  hashForCss: string;
  hashForHTML: string;
};
