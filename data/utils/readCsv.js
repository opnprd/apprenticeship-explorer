const fs = require('fs');
const parse = require('csv-parse');

async function readCsv(filename) {
  const rawData = fs.createReadStream(filename, { encoding: 'utf-8' });
  const parser = parse({
    delimiter: ',',
    columns: true,
  });
  const monitor = new Promise((resolve, reject) => {
    const output = [];
    parser.on('readable', function () {
      let record;
      while (record = parser.read()) {
        output.push(record);
      }
    });
    parser.on('error', reject);
    parser.on('end', () => resolve(output));
  });
  rawData.pipe(parser);
  return monitor;
}

module.exports = readCsv;
