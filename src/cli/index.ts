import * as yargs from 'yargs';

async function main() {
  const ya = yargs
    .scriptName('akshon')
    .commandDir('cmds')
    .recommendCommands()
    .wrap(yargs.terminalWidth())
    .showHelpOnFail(false)
    .env('AKSHON')
    .epilogue('Options can be specified via environment variables with the "AKSHON_" prefix (e.g. "AKSHON_OUTPUT")')
    .help();

  const args = ya.argv;
  if (Object.keys(args).length === 0) {
    yargs.showHelp();
  }
}

main().catch(e => {
  console.error(e.stack);
  process.exit(1);
});