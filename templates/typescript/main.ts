import { Workflow, Job, Step, Action, synth, actions } from 'akshon';

const workflowProps = {
  name: 'build',
  on: {
    push: {
      branches: ['main'],
    },
  },
};

const workflow = new Workflow(workflowProps);

const buildJob = new Job(workflow, 'build', {
  runsOn: 'ubuntu-latest',
  name: 'Build',
});

actions.checkoutV5(buildJob)



workflow.addJob('build', buildJob);

const yaml = synth(workflow);
