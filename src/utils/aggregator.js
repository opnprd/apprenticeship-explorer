function sumKeys({data, keys}) {
  return keys.reduce((acc, key) => (acc + Number.parseFloat(data[key])), 0)
};

export default function aggregator({ data }) {
  if (data.length === 0) return;
  const dataKeys = Object.keys(data[0]).filter(_ => _.match(/\d{4}.*_(Starts|Achievements)/))

  function summariser(acc, curr) {
    dataKeys.forEach(key => {
      if (!acc[key]) acc[key] = 0;
      acc[key] += (Number.parseInt(curr[key]) || 0);  
    })
    return acc;
  }

  const yearly = data.reduce(summariser, {});
  const starts = sumKeys({ data: yearly, keys: ['1516_Starts', '1617_Starts', '1718_Starts'] });
  const estimatedDropoutRate = sumKeys(({ data: yearly, keys: ['1617_Achievements', '1718_Achievements']})) / sumKeys({ data: yearly, keys: ['1415_Starts', '1516_Starts']});

  console.dir({ starts, estimatedDropoutRate })

  return Math.round(starts * estimatedDropoutRate);
}
