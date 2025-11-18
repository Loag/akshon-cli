import { Workflow, Job, Step, Action, actions } from 'akshon';

const workflowProps = {
  name: 'build akshon cli',
  on: {
    push: {
      branches: ['master'],
    },
  },
};

const workflow = new Workflow(workflowProps);

const buildJob = new Job(workflow, 'build', {
  runsOn: 'ubuntu-latest',
  name: 'Build',
  permissions: {
    contents: 'read',
    packages: 'write',
  },
});

actions.checkoutV5(buildJob)

Step.fromAction(buildJob, 'setup-node', new Action('actions', 'setup-node', 'v5'), {
  with: {
    'node-version': 24.11,
    'registry-url': 'https://registry.npmjs.org/',
  },
});

new Step(buildJob, 'install-deps', {
  name: 'Install dependencies',
  run: 'npm install',
});

new Step(buildJob, 'build', {
  name: 'Build',
  run: 'npm run build',
});

new Step(buildJob, 'package', {
  name: 'Package',
  run: 'npm run pack',
});

const publish =
  'NAME=$(jq -r \'.name\' package.json)\n' +
  'VERSION=$(jq -r \'.version\' package.json)\n' +
  'UNSCOPED_NAME=$(echo "$NAME" | sed \'s/.*\\///\')\n' +
  'TARBALL="./dist/${UNSCOPED_NAME}-${VERSION}.tgz"\n' +
  'echo "Tarball is: $TARBALL"\n' +
  'npm publish "$TARBALL"\n';


new Step(buildJob, 'publish', {
  name: 'Publish',
  run: publish,
  env: {
    NODE_AUTH_TOKEN: '${{ secrets.NPM_TOKEN }}',
  },
});

workflow.addJob('build', buildJob);

const filePath = workflow.synth();

console.log(`Generated workflow file: ${filePath}`);

