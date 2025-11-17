import * as fs from 'fs-extra';
import * as yaml from 'yaml';

export enum Language {
  TYPESCRIPT = 'typescript',
  PYTHON = 'python',
  CSHARP = 'csharp',
  JAVA = 'java',
  GO = 'go',
}

const CONFIG_FILE = 'akshon.yaml';

export interface Config {
  readonly app?: string;
  readonly language?: Language;
  readonly output?: string;
}

export function readConfigSync(): Config | undefined {
  if (fs.existsSync(CONFIG_FILE)) {
    const config = {
      ...yaml.parse(fs.readFileSync(CONFIG_FILE, 'utf-8')),
    };

    return config;
  }

  return undefined;
}