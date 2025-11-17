import * as fs from 'fs-extra';
import * as path from 'path';
import * as yargs from 'yargs';
import { execSync } from 'child_process';
import { sscaff } from 'sscaff';

interface InitArgs {
  readonly template?: string;
  readonly dist?: boolean;
}

const pkgroot = path.join(__dirname, '..', '..', '..');
const templatesDir = path.join(pkgroot, 'templates');
const availableTemplates = fs.readdirSync(templatesDir).filter(x => !x.startsWith('.'));

export const command = 'init [template]';
export const describe = 'Create a new akshon project from a template';
export const builder = (args: yargs.Argv) => {
  return args
    .positional('template', {
      describe: 'Project template to use',
      type: 'string',
      default: 'typescript',
      choices: availableTemplates,
    })
    .option('dist', {
      alias: 'd',
      describe: 'Install dependencies after project creation',
      type: 'boolean',
      default: true,
    })
    .showHelpOnFail(false);
};

export const handler = async (args: yargs.Arguments<InitArgs>) => {
  const template = args.template || 'typescript';
  const installDeps = args.dist !== false;

  const cwd = process.cwd();

  // Check if directory is empty
  const files = fs.readdirSync('.').filter(f => !f.startsWith('.'));
  if (files.length > 0) {
    console.error('Cannot initialize a project in a non-empty directory');
    process.exit(1);
  }

  console.error(`Initializing a project from the ${template} template`);
  const templatePath = path.join(templatesDir, template);

  // Get project name from directory
  const projectName = path.basename(cwd);

  // Determine dependencies
  const deps = await determineDeps(projectName);

  try {
    await sscaff(templatePath, '.', deps);
  } catch (er) {
    const e = er as any;
    throw new Error(`error during project initialization: ${e.stack}\nSTDOUT:\n${e.stdout?.toString()}\nSTDERR:\n${e.stderr?.toString()}`);
  }

  // Install dependencies if requested
  if (installDeps) {
    console.log('Installing dependencies...');
    try {
      execSync('npm install', { stdio: 'inherit', cwd });
    } catch (error) {
      console.error('Failed to install dependencies. You can run "npm install" manually.');
    }
  }

  console.log(`\n✅ Successfully initialized akshon project with template "${template}"!`);
};

async function determineDeps(projectName: string): Promise<Record<string, string>> {
  const pkg = fs.readJsonSync(path.join(pkgroot, 'package.json'));
  const akshonVersion = pkg.version;

  return {
    PROJECT_NAME: projectName,
    akshon_version: akshonVersion,
    akshon_cli_spec: `^${akshonVersion}`,
  };
}