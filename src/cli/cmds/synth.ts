import * as fs from 'fs-extra';
import * as path from 'path';
import * as yargs from 'yargs';
import { execSync } from 'child_process';
import * as yaml from 'yaml';

interface SynthArgs {
  readonly file?: string;
}

interface AkshonConfig {
  readonly language?: string;
  readonly app?: string;
  readonly out?: string;
}

export const command = 'synth [file]';
export const describe = 'Synthesize akshon configuration into GitHub Actions workflow';
export const builder = (args: yargs.Argv) => {
  return args
    .positional('file', {
      describe: 'Output workflow file name (default: workflow.yml)',
      type: 'string',
      default: 'workflow.yml',
    })
    .showHelpOnFail(false);
};

export const handler = async (args: yargs.Arguments<SynthArgs>) => {
  const cwd = process.cwd();
  const configFile = path.join(cwd, 'akshon.yaml');

  // Check if akshon.yaml exists
  if (!fs.existsSync(configFile)) {
    console.error('Error: akshon.yaml not found in current directory');
    process.exit(1);
  }

  // Read and parse config
  const configContent = fs.readFileSync(configFile, 'utf-8');
  const config = yaml.parse(configContent) as AkshonConfig;

  // Validate required fields
  if (!config.app) {
    console.error('Error: "app" field is required in akshon.yaml');
    process.exit(1);
  }

  if (!config.out) {
    console.error('Error: "out" field is required in akshon.yaml');
    process.exit(1);
  }

  // Execute the app command and capture output
  console.log(`Running: ${config.app}`);

  const outputDir = path.resolve(cwd, config.out);
  // set env var here
  process.env.AKSHON_WORKFLOW_DIR = outputDir;

  try {
    execSync(config.app, {
      cwd,
      encoding: 'utf-8',
      stdio: ['inherit', 'pipe', 'inherit'],
    });
  } catch (error: any) {
    console.error(`Error executing app command: ${error.message}`);
    process.exit(1);
  }
};

