export default async function loadCsv({ url }) {
  const response = await fetch(url);
  const text = await response.text();
  const [ headings, ...rows ] = text.split('\n')
    .filter(_ => !_.match(/^\s*$/))
    .map(_ => _.split(','));

  const records = rows.reduce((acc, row) => {
    const record = headings.reduce((rec, col, idx) => {
      rec[col] = row[idx];
      return rec;
    }, {})
    acc.push(record);
    return acc;
  }, [])
  return records;
}