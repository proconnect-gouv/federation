import * as reporter from 'cucumber-html-reporter';

interface Options {
  brandTitle?: string;
  columnLayout?: number;
  ignoreBadJsonFile?: boolean;
  jsonDir?: string;
  jsonFile?: string;
  launchReport: boolean;
  metadata?: {
    [key: string]: string;
  };
  name?: string;
  noInlineScreenshots?: boolean;
  output: string;
  reportSuiteAsScenarios: boolean;
  scenarioTimestamp?: boolean;
  screenshotsDirectory?: string;
  storeScreenshots?: boolean;
  theme: 'bootstrap' | 'hierarchy' | 'foundation' | 'simple';
}

const options: Options = {
  jsonDir: 'cypress/reports/cucumber',
  launchReport: true,
  metadata: {
    'App Version': '0.0.1',
    'Test Environment': 'DEV',
  },
  output: 'cypress/reports/cucumber/report.html',
  reportSuiteAsScenarios: true,
  scenarioTimestamp: true,
  theme: 'bootstrap',
};

reporter.generate(options);
