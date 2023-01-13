// logging import and setup
import {ListItemData} from '../constants/listItemData';

const countryIsoJson = require('../../assets/referanceValues/CountryIsoCodes.json');

export const checkSum = (text: string) => {
  let value = 0;
  let isNumber = /([0-9])/;
  for (let i = 0; i < text.length; i++) {
    if (isNumber.test(text.charAt(i))) {
      if (i % 3 === 0) {
        value += 7 * parseInt(text.charAt(i), 10);
      } else if (i % 3 === 1) {
        value += 3 * parseInt(text.charAt(i), 10);
      } else {
        value += parseInt(text.charAt(i), 10);
      }
    } else if (text.charCodeAt(i) === 60) {
      // if the character is a '<'
      value += 0;
    } else {
      if (i % 3 === 0) {
        value += 7 * text.charCodeAt(i) - 55;
      } else if (i % 3 === 1) {
        value += 3 * text.charCodeAt(i) - 55;
      } else {
        value += text.charCodeAt(i) - 55;
      }
    }
  }
  value %= 10;
  return value;
};

/**
 * Extracts information from a 2-line MRZ or a 3-line MRZ
 * @param initialLines
 */
export const parseMRZ = (initialLines: string[]) => {
  let lines: string[] = [];
  // if lines.length >= 2, extract and parse two-line MRZ
  if (initialLines.length >= 2) {
    // return undefined if a double left angle bracket character is found in either last line, or second to last line.
    if (
      initialLines[initialLines.length - 1].indexOf('«') !== -1 ||
      initialLines[initialLines.length - 2].indexOf('«') !== -1
    ) {
      return undefined;
    }
    // remove all empty spaces in each line, capitalize all letters, change all '$' to 'S'
    initialLines.forEach((line: string) => {
      while (line.indexOf(' ') !== -1) {
        line = line.replace(' ', '');
      }
      line = line.toUpperCase();
      while (line.indexOf('$') !== -1) {
        line = line.replace('$', 'S');
      }
      // MLKIT sometimes add a new line character when it finds a new line instead of separating the lines into different elements.
      while (line.indexOf('\n') !== -1) {
        lines.push(line.substring(0, line.indexOf('\n')));
        line = line.substring(line.indexOf('\n') + 1);
      }
      lines.push(line);
    });
    // parse 2 line MRZ if the current line, and the previous line  both have 43, 44, or 45 characters
    for (let i = 1; i < lines.length; i++) {
      if (
        (lines[i].length > 42 &&
          lines[i].length < 46 &&
          lines[i - 1].length > 42 &&
          lines[i - 1].length < 46) ||
        (lines[i].length > 35 &&
          lines[i].length < 37 &&
          lines[i - 1].length > 35 &&
          lines[i - 1].length < 37)
      ) {
        return parse2LineMRZ(lines[i - 1], lines[i]);
      }
    }
  } // end (lines.length >= 2)
  if (lines.length >= 3) {
    // At this point, empty spaces will already be removed and all letters will be capitalized.
    // return undefined if a double left angle bracket character is found in third to last line.
    if (lines[lines.length - 3].indexOf('«') !== -1) {
      return undefined;
    }
    for (let i = 2; i < lines.length; i++) {
      if (
        lines[i].length > 28 &&
        lines[i].length < 32 &&
        lines[i - 1].length > 28 &&
        lines[i - 1].length < 32 &&
        lines[i - 2].length > 28 &&
        lines[i - 2].length < 32
      ) {
        return parse3LineMRZ(lines[i - 2], lines[i - 1], lines[i]);
      }
    }
  } // end (lines.length >= 3)
  return undefined;
};

const parse2LineMRZ = (firstRow: string, secondRow: string) => {
  let docType = extractDocType(firstRow);
  let namesFromLine: {givenNames: string[]; lastNames: string[]} =
    extractNamesFromLine(5, firstRow);
  let givenNames: string[] = namesFromLine.givenNames;
  let lastNames: string[] = namesFromLine.lastNames;

  // Extract idNumber
  let idNumber = extractIdNumber(secondRow, 0, 9);
  if (!idNumber) {
    return undefined;
  }

  // extract issuing country from document holder
  let issuingCountry = extractCountry(firstRow, 2, 5);

  // extract Nationality of the document holder
  let nationality = extractCountry(secondRow, 10, 13);

  // extract dateOfBirth
  let dob = extractDateOfBirthFromLine(13, secondRow);

  // Extract gender
  // let gender = extractGender(secondRow.charAt(20), issuingCountry, docType);
  let gender = extractGender(secondRow.charAt(20));
  // let gender = secondRow.charAt(20);

  // Extract expiration date then assign the YYYY-MM-DD string format to docExpirationDate
  let docExpirationDate = extractDateOfExpirationFromLine(21, secondRow);

  return {
    docMRZ: `${firstRow}\n${secondRow}`,
    docType: docType,
    issuingCountry: issuingCountry,
    givenNames: givenNames.join(' ').trim(),
    lastNames: lastNames.join(' ').trim(),
    idNumber: idNumber,
    nationality: nationality,
    dob: dob,
    gender: gender,
    docExpirationDate: docExpirationDate,
    additionalInformation: undefined, // TODO remove? (The logic for extracting additional information was deleted since we're not using it)
  };
};

const parse3LineMRZ = (
  firstRow: string,
  secondRow: string,
  thirdRow: string,
) => {
  let docType = extractDocType(firstRow);
  let namesFromLine: {givenNames: string[]; lastNames: string[]} =
    extractNamesFromLine(0, thirdRow);
  let givenNames: string[] = namesFromLine.givenNames;
  let lastNames: string[] = namesFromLine.lastNames;

  // Extract idNumber
  let idNumber = extractIdNumber(firstRow, 5, 14);
  if (!idNumber) {
    return undefined;
  }
  // Extract issuingCountry
  let issuingCountry = extractCountry(firstRow, 2, 5);
  // Extract nationality
  let nationality = extractCountry(secondRow, 15, 18);
  // Extract date of birth
  let dob = extractDateOfBirthFromLine(0, secondRow);
  // Extract gender
  let gender = extractGender(secondRow.charAt(7));

  // Extract expiration date then store that date as a string in docExpirationDate
  let docExpirationDate = extractDateOfExpirationFromLine(8, secondRow);
  // extract additional information from first and second row
  let additionalInformation = '';
  additionalInformation =
    firstRow.substring(15, 30) + secondRow.substring(18, 29);
  while (additionalInformation.indexOf('<') !== -1) {
    additionalInformation = additionalInformation.replace('<', ' ');
  }
  additionalInformation = additionalInformation.trim();

  return {
    docMRZ: `${firstRow}\n${secondRow}\n${thirdRow}`,
    docType: docType,
    issuingCountry: issuingCountry,
    givenNames: givenNames.join(' ').trim(),
    lastNames: lastNames.join(' ').trim(),
    idNumber: idNumber,
    nationality: nationality,
    dob: dob,
    gender: gender,
    docExpirationDate: docExpirationDate,
    additionalInformation: additionalInformation,
  };
};

const extractDocType = (line: string) => {
  const docTypeLen: number = line.charAt(1) === '<' ? 1 : 2;
  const docType: string = line.substring(0, docTypeLen);
  return getDocTypeFromCode(docType);
};

export const getDocTypeFromCode = (docCode?: string) => {
  return ListItemData.DOCUMENT_TYPE.find(doc =>
    doc.codes.find(code => code === docCode),
  )?.value;
};

const extractIdNumber = (
  line: string,
  startingIndex: number,
  endingIndex: number,
) => {
  let idNumber = line.substring(startingIndex, endingIndex);
  // replace all 'O' with '0'
  while (idNumber.indexOf('O') !== -1) {
    idNumber = idNumber.replace('O', '0');
  }

  // calculate the checksum using idNumber then compare it with the checksum on the document
  let idNumberCheckSum = checkSum(idNumber);
  if (idNumberCheckSum === parseInt(line.charAt(endingIndex), 10)) {
  }

  // remove all '<' from idNumber
  while (idNumber.indexOf('<') !== -1) {
    idNumber = idNumber.replace('<', '');
  }
  return idNumber;
};

type CountryIsoCode = {
  isoCountryNumber: string;
  isoCountryCode: string;
  countryName: string;
};

const extractCountry = (
  line: string,
  startingIndex: number,
  endingIndex: number,
) => {
  let country = line.substring(startingIndex, endingIndex);

  // ensure 6's, 0's, and 2's are swapped out with G's, O's, and Z'z respectively
  country = replaceNumbersWithCorrespondingLetters(country);

  // if country is germany, return DEU
  if (country === 'D<<') {
    return 'DEU';
  }

  // if country is in countryIsoJson, return it, if not return undefined
  return countryIsoJson.find(
    (item: CountryIsoCode) => item.isoCountryCode === country,
  )?.isoCountryCode;
};

const extractDateOfExpirationFromLine = (
  startingIndex: number,
  line: string,
) => {
  // replace all 'O' with '0'
  while (line.substring(startingIndex, startingIndex + 6).indexOf('O') !== -1) {
    line = line.replace('O', '0');
  }
  let twoDigitYearOfExpiration = line.substring(
    startingIndex,
    startingIndex + 2,
  );
  let twoDigitMonthOfExpiration = line.substring(
    startingIndex + 2,
    startingIndex + 4,
  );
  let twoDigitDayOfExpiration = line.substring(
    startingIndex + 4,
    startingIndex + 6,
  );
  let fullYearOfExpDate = 2000 + parseInt(twoDigitYearOfExpiration, 10);
  let currentYear = new Date().getFullYear();
  if (fullYearOfExpDate - currentYear > 10) {
    fullYearOfExpDate -= 100;
  }
  // ensure expiration date is valid. if not, return undefined
  let docExpirationDate = `${fullYearOfExpDate}-${twoDigitMonthOfExpiration}-${twoDigitDayOfExpiration}`;
  if (new Date(docExpirationDate).toString() === 'Invalid Date') {
    return undefined;
  }
  // Confirm checkSum for date of expiration
  let expDateCheckSum = checkSum(
    twoDigitYearOfExpiration +
      twoDigitMonthOfExpiration +
      twoDigitDayOfExpiration,
  );
  if (expDateCheckSum === parseInt(line.charAt(startingIndex + 6), 10)) {
    return docExpirationDate;
  }
};

const extractDateOfBirthFromLine = (startingIndex: number, line: string) => {
  // replace all 'O' with '0'
  while (line.substring(startingIndex, startingIndex + 6).indexOf('O') !== -1) {
    line = line.replace('O', '0');
  }
  let twoDigitYearOfBirth = line.substring(startingIndex, startingIndex + 2);
  let twoDigitMonthOfBirth = line.substring(
    startingIndex + 2,
    startingIndex + 4,
  );
  let twoDigitDayOfBirth = line.substring(startingIndex + 4, startingIndex + 6);
  let fullYearOfBirth = 2000 + parseInt(twoDigitYearOfBirth, 10);
  let currentYear = new Date().getFullYear();
  if (currentYear - fullYearOfBirth < 0) {
    fullYearOfBirth -= 100;
  }
  // Confirm checkSum for date of birth
  let dobCheckSum = checkSum(
    twoDigitYearOfBirth + twoDigitMonthOfBirth + twoDigitDayOfBirth,
  );
  let dob = `${fullYearOfBirth}-${twoDigitMonthOfBirth}-${twoDigitDayOfBirth}`;
  // ensure date of birth is a valid date. if not, return undefined
  if (new Date(dob).toString() === 'Invalid Date') {
    return undefined;
  }
  if (dobCheckSum === parseInt(line.charAt(startingIndex + 6), 10)) {
    return dob;
  }
};

const extractNamesFromLine = (startingIndex: number, line: string) => {
  let angleBracketCount = 0;
  let lastNamesExtracted = false;
  let lastNames = [];
  let lastName = '';
  let givenNames = [];
  let givenName = '';
  for (let i = startingIndex; i < line.length; i++) {
    if (line.charAt(i) !== '<' && !lastNamesExtracted) {
      angleBracketCount = 0;
      lastName += line.charAt(i);
      if (i === line.length - 1) {
        lastNames.push(lastName);
      }
    }
    // append to givenName
    else if (line.charAt(i) !== '<' && lastNamesExtracted) {
      angleBracketCount = 0;
      givenName += line.charAt(i);
      if (i === line.length - 1) {
        givenNames.push(givenName);
      }
    }
    // append to lastNames[]
    else if (
      line.charAt(i) === '<' &&
      angleBracketCount === 0 &&
      !lastNamesExtracted
    ) {
      lastNames.push(lastName);
      lastName = '';
      angleBracketCount++;
    }
    // append to givenNames[]
    else if (
      line.charAt(i) === '<' &&
      angleBracketCount === 0 &&
      lastNamesExtracted
    ) {
      givenNames.push(givenName);
      givenName = '';
      angleBracketCount++;
    }
    // switch from lastName extraction to givenName extraction
    else if (
      line.charAt(i) === '<' &&
      angleBracketCount === 1 &&
      !lastNamesExtracted
    ) {
      lastNames.push(lastName);
      lastNamesExtracted = true;
      angleBracketCount = 0;
    }
    // end extraction
    else if (
      line.charAt(i) === '<' &&
      angleBracketCount === 1 &&
      lastNamesExtracted
    ) {
      givenNames.push(givenName);
      break;
    }
  }

  // remove empty strings from givenNames and lastNames
  givenNames = givenNames.filter(fName => fName.length > 0);
  lastNames = lastNames.filter(lName => lName.length > 0);

  // ensure 6's, 0's, and 2's are swapped out with G's, O's, and Z'z respectively
  for (let i = 0; i < givenNames.length; i++) {
    givenNames[i] = replaceNumbersWithCorrespondingLetters(givenNames[i]);
  }
  for (let i = 0; i < lastNames.length; i++) {
    lastNames[i] = replaceNumbersWithCorrespondingLetters(lastNames[i]);
  }
  return {
    givenNames,
    lastNames,
  };
};

const replaceNumbersWithCorrespondingLetters = (word: string) => {
  while (word.indexOf('0') !== -1) {
    word = word.replace('0', 'O');
  }
  while (word.indexOf('6') !== -1) {
    word = word.replace('6', 'G');
  }
  while (word.indexOf('2') !== -1) {
    word = word.replace('2', 'Z');
  }
  while (word.indexOf('1') !== -1) {
    word = word.replace('1', 'I');
  }
  return word;
};

const extractGender = (letter: string) => {
  if (letter === '<') {
    return 'U';
  }
  if (letter === 'H') {
    return 'M';
  }
  return letter;
};
