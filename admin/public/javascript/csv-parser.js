import * as Papa from 'papaparse';
import isBase64 from 'validator/lib/isBase64';

const FALSY_REGEX = /^false|null|undefined$/;
const CSV_SIZE_LIMIT = 1572864;
const SUCCESS = 'green';
const ERROR = 'red';

export function csvParser(element) {
  handleFile();
  element.addEventListener('change', function(el) {
    const alertError = document.querySelector('#alert_error');
    if (alertError) {
      alertError.remove();
    }
    document.querySelector('#fs-form').reset();
    if (el) {
      const file = el.srcElement.files[0];
      if (isSizeOk(file.size)) {
        getName(file);
        getData(file);
      }
    }
  });
  // CSVParser is initialized
  element.classList.add('csv');
}

/**
 * Check if the browser support the FileReader API
 */
const handleFile = () => {
  if (!window.FileReader) {
    displayError(`L'API FileReader n'est pas supportée par votre navigateur.`);
  }
};

/**
 * Get the data from csv
 * @param {file} file
 */
const getData = file => {
  const csvReader = new FileReader();
  csvReader.onload = loadHandler;
  csvReader.onerror = csvErrorHandler;
  csvReader.readAsText(file);
};

/**
 * Getting the csv file's name for display
 * @param {string} file
 */
const getName = file => {
  const csvName = document.querySelector('#file-name');
  csvName.textContent = file.name;
};

/**
 * Parsing csv data
 * @param {Array} csvFile
 */
const parseData = csvFile => {
  let parsedData = {};
  try {
    // improve CSV delimiter detection
    const indexComma = csvFile.indexOf(',');
    const indexSemi = csvFile.indexOf(';');
    const delimiter = 0 < indexSemi && indexSemi < indexComma ? ';' : '';

    const { data } = Papa.parse(csvFile, { delimiter });
    const [csvColumn, csvValue] = data;

    if (csvColumn.length !== csvValue.length) {
      throw new Error('Problème de parsing');
    }

    // Build object data from CSV table records
    parsedData = csvColumn.reduce(
      (parsed, element, index) => ({ ...parsed, [element]: csvValue[index] }),
      parsedData,
    );
  } catch (error) {
    displayError(error.message);
  }
  return parsedData;
};

/**
 * Call function for:
 * parsing data
 * filling the form with the parsed data
 * @param {Object} event
 */
const loadHandler = event => {
  const csvFile = event.target.result;
  const csvPasredData = parseData(csvFile);
  fillFormWithCsvData(csvPasredData);
};

/**
 * Handle error if reading csv is not possible
 * @param {Object} event
 */
const csvErrorHandler = event => {
  if (event.target.error.name === 'NotReadableError') {
    displayError('Impossible de lire le fichier.');
  }
};

/**
 * Filling the form with parsed data from csv
 * @param {Array} data
 */
const fillFormWithCsvData = data => {
  if ('scopes' in data) {
    const { scopes = '' } = data;
    const scopesList = scopes.split(',');
    scopesList
      .filter(scope => scope)
      .map(scope => {
        try {
          return document.querySelector(`#scope-${scope}`);
        } catch (e) {
          console.warn(`scope ${scope} indisponible.`);
          return null;
        }
      })
      .filter(input => input)
      .forEach(checkbox => {
        checkbox.checked = true;
      });
    delete data.scopes;
  }

  // standard inputs
  Object.entries(data)
    .map(([key, value]) => {
      let input = null;
      let check = null;
      try {
        input = document.querySelector(`#${key}`);
        check = document.querySelector(`#${key}_${value}`);
      } catch (e) {}
      if (input) {
        return [
          input,
          !value || FALSY_REGEX.test(value) ? '' : value.replace(/,/g, '\r\n'),
        ];
      } else if (check) {
        check.checked = true;
      } else {
        console.warn(
          'Champs / Informations indisponible.' + key + ' => ' + value,
        );
        return null;
      }
    })
    .filter(data => data) // remove all null previous results
    .forEach(([input, value]) => {
      console.log(`input: ${input} - value : ${value}`);
      input.value = value;
    });
};

/**
 * Check if csv size is allowed.
 * @param {number} size
 */
const isSizeOk = size => {
  if (size > CSV_SIZE_LIMIT) {
    displayError(
      'Le fichier csv est trop lourd. La taille maximum est de 1.5Mo',
    );
    setTextColor(ERROR);
    return false;
  }
  setTextColor(SUCCESS);
  return true;
};

/**
 * Display error message relative to importing a csv.
 * @param {string} message
 */
const displayError = message => {
  const alertContainer = document.querySelector('#form-card');
  const alert = document.createElement('div');

  alert.classList.add('alert', 'alert-danger', 'mt-3');
  alert.setAttribute('id', 'alert_error');
  alert.innerHTML = message;

  alertContainer.insertAdjacentElement('afterbegin', alert);

  console.error(message);
};

/**
 * Check validity of the dataURI
 * @param {string} dataURI
 */
const checkDataUriValues = dataURI => {
  const [type, base64] = dataURI.split(';');
  const [format, extension] = type.split('/');
  const [, base64String] = base64.split(',');
  const isB64Ok = isBase64(base64String);
  const isTypeOk =
    format === 'data:image' &&
    ['png', 'jpg', 'jpeg', 'gif', 'svg+xml'].includes(extension);
  return isTypeOk && isB64Ok;
};

/**
 * Set text color if error or valid csv file or actions.
 * @param {string} color
 */
const setTextColor = color => {
  const csvName = document.querySelector('#file-name');
  csvName.style.color = color;
};
