const readCsv = require('./utils/readCsv');
const writeJson = require('./utils/writeJson');

const path = require('path');

const apprenticeshipDataFile = path.resolve(__dirname, 'sources', 'July_2019_UD_demographics_LAD.csv')
const reportJson = path.resolve(__dirname, '..', 'report.json')

function filter (data) {
  const wantedLads = [
    'Bradford',
    'Calderdale',
    'Kirklees',
    'Leeds',
    'Wakefield',
  ];
  const areaLimit = (record) => wantedLads.includes(record.LAD);

  const removeTotals = (record) => (
    record.Level !== 'Totals' &&
    record['SSA T1'] !== 'Totals' &&
    record['Ethnicity Group'] === 'Totals' &&
    record.LAD !== 'Totals' &&
    record.Gender !== 'Totals' &&
    record.Age === 'Totals' &&
    record.LLDD === 'Totals'
  );
  return data.filter(areaLimit).filter(removeTotals);
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

readCsv(apprenticeshipDataFile)
  .then(filter)
  .then(clean)
  .then(writeJson(reportJson))
  .then(console.log)
  .catch(console.error);