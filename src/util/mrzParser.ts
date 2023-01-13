// logging import and setup
import {ListItemData} from '../constants/listItemData';

const countryIsoJson = require('../constants/CountryIsoCodes.json');

/**
 * It takes a string, and returns a number
 * @param {string} text - The text to be encoded.
 * @returns The checkSum function returns the check sum of the input string.
 */
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

export const parseMRZ = (initialLines: string[]) => {
  let lines: string[] = [];
  const firstInitialLastLine = initialLines[initialLines.length - 1];
  const secondInitialLastLine = initialLines[initialLines.length - 2];
  // if lines.length >= 2, extract and parse two-line MRZ
  if (
    initialLines &&
    initialLines.length >= 2 &&
    firstInitialLastLine &&
    secondInitialLastLine
  ) {
    // return undefined if a double left angle bracket character is found in either last line, or second to last line.
    if (
      firstInitialLastLine.indexOf('«') !== -1 ||
      secondInitialLastLine.indexOf('«') !== -1
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
      const currentLine = lines[i];
      const lastLine = lines[i - 1];
      if (currentLine && lastLine) {
        if (
          (currentLine.length > 42 &&
            currentLine.length < 46 &&
            lastLine.length > 42 &&
            lastLine.length < 46) ||
          (currentLine.length > 35 &&
            currentLine.length < 37 &&
            lastLine.length > 35 &&
            lastLine.length < 37)
        ) {
          return parse2LineMRZ(lastLine, currentLine);
          // return parse([lastLine, currentLine]);
        }
      }
    }
  } // end (lines.length >= 2)
  if (lines.length >= 3) {
    // At this point, empty spaces will already be removed and all letters will be capitalized.
    // return undefined if a double left angle bracket character is found in third to last line.
    const thirdToLastLine = lines[lines.length - 3];
    if (thirdToLastLine && thirdToLastLine.indexOf('«') !== -1) {
      return undefined;
    }
    for (let i = 2; i < lines.length; i++) {
      const currentLine = lines[i];
      const lastLine = lines[i - 1];
      const secondToLastLine = lines[i - 2];
      if (currentLine && lastLine && secondToLastLine) {
        if (
          currentLine.length > 28 &&
          currentLine.length < 32 &&
          lastLine.length > 28 &&
          lastLine.length < 32 &&
          secondToLastLine.length > 28 &&
          secondToLastLine.length < 32
        ) {
          return parse3LineMRZ(secondToLastLine, lastLine, currentLine);
          // return parse([secondToLastLine, lastLine, currentLine]);
        }
      }
    }
  } // end (lines.length >= 3)
  return undefined;
};

/**
 * It takes two strings, parses them, and returns an object with the parsed data
 * @param {string} firstRow - string, secondRow: string
 * @param {string} secondRow - string =
 * "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<<<<<\nL898902C<3UTO6908061F9406236ZE184226B<<<<<14"
 * @returns an object with the following properties:
 * docMRZ: `\n`,
 * docType: docType,
 * issuingCountry: issuingCountry,
 * givenNames: givenNames.join(' ').trim(),
 * lastNames: lastNames.join(' ').trim(),
 * idNumber: idNumber,
 * nationality
 */
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

/**
 * It takes in three strings, and returns an object with the following properties: docMRZ, docType,
 * issuingCountry, givenNames, lastNames, idNumber, nationality, dob, gender, docExpirationDate, and
 * additionalInformation
 * @param {string} firstRow - string,
 * @param {string} secondRow - string,
 * @param {string} thirdRow - string,
 * @returns An object with the following properties:
 * docMRZ: string
 * docType: string
 * issuingCountry: string
 * givenNames: string
 * lastNames: string
 * idNumber: string
 * nationality: string
 * dob: string
 * gender: string
 * docExpirationDate: string
 * additionalInformation: string
 */
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

/**
 * It takes a string and returns a string
 * @param {string} line - string - the line of text that we're parsing
 * @returns the docType.
 */
const extractDocType = (line: string) => {
  const docTypeLen: number = line.charAt(1) === '<' ? 1 : 2;
  const docType: string = line.substring(0, docTypeLen);
  return getDocTypeFromCode(docType);
};

/**
 * It takes a document code and returns the document type
 * @param {string} [docCode] - string
 * @returns The value of the first item in the array that has a codes array that contains the docCode.
 */
export const getDocTypeFromCode = (docCode?: string) => {
  return ListItemData.DOCUMENT_TYPE.find(doc =>
    doc.codes.find(code => code === docCode),
  )?.value;
};

/**
 * It takes a string, extracts a substring from it, replaces all 'O' with '0', calculates the checksum
 * of the substring, compares it with the checksum on the document, removes all '<' from the substring,
 * and returns the substring.
 * @param {string} line - the line of text that contains the ID number
 * @param {number} startingIndex - the index of the first character of the ID number
 * @param {number} endingIndex - the index of the last character of the id number
 * @returns The ID number.
 */
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

/**
 * A CountryIsoCode is an object with a string property called isoCountryNumber, a string property
 * called isoCountryCode, and a string property called countryName.
 * @property {string} isoCountryNumber - The ISO country number.
 * @property {string} isoCountryCode - The ISO 3166-1 alpha-2 code for the country.
 * @property {string} countryName - The name of the country.
 */
type CountryIsoCode = {
  isoCountryNumber: string;
  isoCountryCode: string;
  countryName: string;
};

/**
 * It takes a string, and two numbers, and returns a string.
 * @param {string} line - string - the line of text that we're parsing
 * @param {number} startingIndex - the index of the first character of the country code
 * @param {number} endingIndex - number = line.length,
 * @returns A function that takes 3 parameters and returns a string.
 */
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

/**
 * It takes a starting index and a line of text, and returns a date of expiration if it can find one.
 * @param {number} startingIndex - number,
 * @param {string} line - string - the line of text that contains the date of expiration
 * @returns A date string in the format of YYYY-MM-DD
 */
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
  return undefined;
};

/**
 * It takes a starting index and a line of text, and returns a date of birth if the checksum is valid,
 * otherwise it returns undefined
 * @param {number} startingIndex - The index of the first character of the date of birth in the line
 * @param {string} line - the line of text that contains the date of birth
 * @returns A function that takes two parameters, startingIndex and line.
 */
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
  return undefined;
};

/**
 * It takes a string and extracts the given names and last names from it.
 * @param {number} startingIndex - number - the index of the line where the names start
 * @param {string} line - the line of text that contains the names
 * @returns An object with two properties: givenNames and lastNames.
 */
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
    const initialGivenName = givenNames[i];
    if (initialGivenName) {
      givenNames[i] = replaceNumbersWithCorrespondingLetters(initialGivenName);
    }
  }
  for (let i = 0; i < lastNames.length; i++) {
    const initialLastName = lastNames[i];
    if (initialLastName) {
      lastNames[i] = replaceNumbersWithCorrespondingLetters(initialLastName);
    }
  }
  return {
    givenNames,
    lastNames,
  };
};

/**
 * It replaces all the numbers in a string with their corresponding letters
 * @param {string} word - string - the word that you want to replace the numbers with letters
 * @returns The word with the numbers replaced with the corresponding letters.
 */
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

/**
 * If the letter is '<', return 'U', if the letter is 'H', return 'M', otherwise return the letter
 * @param {string} letter - string - the letter to extract the gender from
 * @returns the letter if it is not '<' or 'H'.
 */
const extractGender = (letter: string) => {
  if (letter === '<') {
    return 'U';
  }
  if (letter === 'H') {
    return 'M';
  }
  return letter;
};
