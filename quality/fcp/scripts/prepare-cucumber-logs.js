/**
 * Add Screenshot and Video attachments to the Cucumber logs
 */
const fs = require('fs');
const glob = require('glob');
const path = require('path');

// Fetch Arguments

const args = process.argv;

const cucumberJsonDir = args[2] || './cypress/reports/cucumber';
const screenshotsDir = args[3] || './cypress/screenshots';
const videosDir = args[4] || './cypress/videos';

// Init

const cukeMap = {};
const jsonNames = {};

const jsonPath = path.join(__dirname, '..', cucumberJsonDir);
const screenshotsPath = path.join(__dirname, '..', screenshotsDir);
const videosPath = path.join(__dirname, '..', videosDir);

// Functions

/**
 * Returns the failed step or null
 */
const getFailedStepFromScenario = (cuke, scenarioName) => {
  console.log(scenarioName);
  console.log(cuke);
  const myScenario = cuke.elements.find((e) => e.name === scenarioName);
  const myStep = myScenario.steps.find(
    (step) => step.result.status !== 'passed',
  );
  if (myStep && !myStep.embeddings) {
    myStep.embeddings = [];
  }
  return myStep;
};

const addScreenshotToStep = (screenshotPath, step) => {
  const data = fs.readFileSync(screenshotPath);
  if (data) {
    const base64Image = Buffer.from(data, 'binary').toString('base64');
    step.embeddings.push({ data: base64Image, mime_type: 'image/png' });
  }
};

const videoContainer = (videoPath) => {
  const videoHTML = `
  <a href="#video" data-toggle="collapse" class="collapsed">+ Show Video</a>
  <div id="video" class="scenario-step-collapse collapse" aria-expanded="false" style="height: 0px;">
    <div class="info">
      <video controls="" width="500"><source type="video/mp4" src="${videoPath}"></video>
    </div>
  </div>`;
  return videoHTML;
};

// Retrieve all the CucumberJson files
const files = fs
  .readdirSync(jsonPath, { withFileTypes: true })
  .filter((file) => file.isFile())
  .map((file) => file.name);

// Keep track for each feature of the CucumbeJson file path and content
files.forEach((file) => {
  const json = JSON.parse(
    fs.readFileSync(path.join(jsonPath, file)).toString(),
  );
  const arr = file.split('.');
  const featureName = `${arr[0]}.feature`;
  jsonNames[featureName] = file;
  cukeMap[featureName] = json;
});

// For each Cypress video (local execution)
const videos = glob.sync(`${videosPath}/**/*.mp4`);
videos.forEach((videoPath) => {
  const featureName = path.basename(videoPath, '.mp4');
  // Add video link in the feature description
  const videoLink = videoContainer(videoPath);
  const featureDescription = `${cukeMap[featureName][0].description}\n<br />${videoLink}`;
  cukeMap[featureName][0].description = featureDescription;
});

// Retrieve all Cypress screenshots
const screenshots = glob
  .sync(`${screenshotsPath}/**/*.png`)
  .map((screenshotPath) => {
    return {
      screenshotName: path.basename(screenshotPath),
      screenshotPath,
      feature: path.basename(path.dirname(screenshotPath)),
    };
  });

// For each Cypress screenshot
screenshots.forEach(({ feature, screenshotName, screenshotPath }) => {
  const scenarioName = screenshotName
    .match(/--\s(.+).png/)[1]
    .replace('(failed)', '')
    .replace(/\(example #\d+\)/, '')
    .trim();

  // Add the screenshot to the failed step
  const myStep = getFailedStepFromScenario(cukeMap[feature][0], scenarioName);
  if (myStep) {
    addScreenshotToStep(screenshotPath, myStep);

    // Update the Cucumber logs
    fs.writeFileSync(
      path.join(jsonPath, jsonNames[feature]),
      JSON.stringify(cukeMap[feature], null, 2),
    );
  }
});
