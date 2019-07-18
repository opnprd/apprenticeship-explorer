const readCsv = require('./utils/readCsv');
const writeJson = require('./utils/writeJson');

const path = require('path');

const apprenticeshipDataFile = path.resolve(__dirname, 'sources', 'July_2019_UD_demographics_LAD.csv')
const reportJson = path.resolve(__dirname, '..', 'report.json')

const onsLookup = require('./sources/ons.json');

function filter (data) {
  const removeTotals = (record) => (
    record.Level !== 'Totals' &&
    record['SSA T1'] !== 'Totals' &&
    record['Ethnicity Group'] === 'Totals' &&
    record.LAD !== 'Totals' && record.LAD !== 'Other' &&
    record.Gender !== 'Totals' &&
    record.Age === 'Totals' &&
    record.LLDD === 'Totals'
  );
  return data.filter(removeTotals);
}

function areaFilter (data) {
  const areaLimit = (record) => record.onsRegion === 'E12000003';
  return data.filter(areaLimit);
}
function clean (data) {
  const fieldsToClean = [
    '1415_Starts',
    '1516_Starts',
    '1617_Starts',
    '1718_Starts',
    '1819_Q3_Starts',
    '1415_Achievements',
    '1516_Achievements',
    '1617_Achievements',
    '1718_Achievements',
    '1819_Q3_Achievements'
  ]
  const cleaner = (record) => {
    fieldsToClean.map(f => record[f] = parseInt(record[f]));
    return record;
  }
  return data.map(cleaner);
}

function prettyPrint(data) {
  return JSON.stringify(data, null, 2);
}

function getOnsCode(record) {
  const codes = onsLookup
    .filter(_ => _.name === record.LAD)
    .filter(_ => ['LAD18'].includes(_.prefix));
  if (codes.length !== 1) throw new Error(`Found ${codes.length} codes for '${record.LAD}'`);
  const code = codes[0].code
  const region = codes[0].refs.filter(_ => _.type === 'RGN18CD')[0].target;
  return { code, region };
}

function geographize(data) {
  const correctNames = (record) => {
    const replacement = {
      'Barrow in Furness': 'Barrow-in-Furness',
      'Bristol ': 'Bristol, City of',
      'Herefordshire ': 'Herefordshire, County of',
      'Kings Lynn and West Norfolk': 'King\'s Lynn and West Norfolk',
      'Newcastle under Lyme': 'Newcastle-under-Lyme',
      'Southend on Sea': 'Southend-on-Sea',
      'St Helens': 'St. Helens',
      'Stockton on Tees': 'Stockton-on-Tees',
      'Stoke on Trent': 'Stoke-on-Trent',
      'Stratford on Avon': 'Stratford-on-Avon',
      'Kingston upon Hull ': 'Kingston upon Hull, City of',
      'Shepway': 'Folkestone and Hythe',
    }
    const newName = replacement[record.LAD];
    if (newName) record.LAD = newName;
    return record;
  }
  const addOnsCodes = (record) => {
    const ons = getOnsCode(record);
    record.onsCode = ons.code;
    record.onsRegion = ons.region;
    return record;
  };
  return data.map(correctNames)
    .map(addOnsCodes);
}

readCsv(apprenticeshipDataFile)
  .then(filter)
  .then(geographize)
  .then(clean)
  .then(writeJson(reportJson))
  .then(console.log)
  .catch(console.error);