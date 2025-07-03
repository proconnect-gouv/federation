const UNAUTHORIZED = require('./unauthorized');

export function comparePassword(element) {
  const password = document.getElementById('password');
  password.addEventListener('input', function () {
    matcheRegexpInput(/(?=.*[A-Z])/, password.value, document.getElementById('uppercase-icon'));
    matcheRegexpInput(/(?=.*[a-z])/, password.value, document.getElementById('lowercase-icon'));
    matcheRegexpInput(/(?=.*?\d)/, password.value, document.getElementById('number-icon'));
    matcheRegexpInput(/(?=.*?[^a-zA-Z0-9\s])/, password.value, document.getElementById('special-character-icon'));
    matcheRegexpInput(/^[\S]{12,72}$/, password.value, document.getElementById('length-icon'));
    if (password.value.length >= 3) {
      hasRecurrentPattern(password.value, document.getElementById('patterns-icon'), 3);
    }
  });

  element.addEventListener('input', function () {
    // check input pattern
    if (password.value !== element.value) {
      element.classList.remove('is-valid');
      element.classList.add('is-invalid');
    } else {
      element.classList.remove('is-invalid');
      element.classList.add('is-valid');
    }

  }, false);
}

function matcheRegexpInput(regexp, value, documentId) {
  if (regexp.test(value)) {
    documentId.classList.add('valid-password');
  } else {
    documentId.classList.remove('valid-password');
  }
}

function hasRecurrentPattern(value, documentId, patternLength) {
  const patterns = [];
  const maxIndex = value.length - patternLength;
  for (let index = 0; index < maxIndex; index += 1) {
    patterns.push(value.substring(index, index + patternLength));
  }

  const occurringMoreThanOnce = patterns.filter(
    pattern => value.split(pattern).length !== 2,
  );

  if(occurringMoreThanOnce.length > 0 || hasEasyToGuessPatterns(value)) {
    documentId.classList.remove('valid-password');
  } else {
    documentId.classList.add('valid-password');
  }
}

function hasEasyToGuessPatterns(password) {
  if (hasUnhauthorizedCaractersChain(password)) {
    return true;
  }

  if (hasRepeteadCharacters(password)) {
    return true;
  }

  if (hasCharactersFollowingEachOther(password)) {
    return true;
  }

  return false;
}
function hasUnhauthorizedCaractersChain(password) {
  const unauthorized = UNAUTHORIZED;
  return unauthorized
    .map(word => password.includes(word))
    .reduce((acc, val) => acc || val);
}

function hasRepeteadCharacters(password) {
  const passwordLength = password.length - 2;
  for (let char = 0; char < passwordLength; char += 1) {
    if (
      password[char] === password[char + 1] &&
      password[char] === password[char + 2]
    ) {
      return true;
    }
  }
  return false;
}

function hasCharactersFollowingEachOther(password) {
  const passwordLength = password.length - 2;
  const lowerCasePassword = password.toLowerCase();
  for (let char = 0; char < passwordLength; char += 1) {
    const isNumber = 48 <= char && char <= 57;
    const isLowerCaseLetter = 97 <= char && char <= 122;
    if (isNumber || isLowerCaseLetter) {
      const currCharCode = lowerCasePassword[char].charCodeAt(0);
      const nextCharCode = lowerCasePassword[char + 1].charCodeAt(0);
      const secondNextCharCode = lowerCasePassword[char + 2].charCodeAt(0);
      return (
        currCharCode + 1 === nextCharCode &&
        currCharCode + 2 === secondNextCharCode
      );
    }
  }
  return false;
}
