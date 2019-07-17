const fs = require('fs');

function writeJson(filename) {
  const output = fs.createWriteStream(filename, { encoding: 'utf-8' });

  return async (data) => {
    const monitor = new Promise((resolve, reject) => {
      output.on('error', reject);
      output.on('finish', () => resolve(filename));
    })
    output.write(JSON.stringify(data));
    return monitor;
  }
}

module.exports = writeJson;
