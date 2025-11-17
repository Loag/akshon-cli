import { Construct } from 'constructs';
import { App, Chart } from 'cdk8s';

class MyChart extends Chart {
  constructor(scope: Construct, id: string, props: {}) {
    super(scope, id, props);

    // define resources here
  }
}

const app = new App();
new MyChart(app, 'my-chart');
app.synth();

