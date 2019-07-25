function summariser(data) {
  return (acc, curr) => {
    data.forEach(key => {
      if (!acc[key]) acc[key] = 0;
      acc[key] += Number.parseInt(curr[key]) || 0;
    });
    return acc;
  };
}

function getKeys({ data, index = 0 }) {
  return Object.keys(data[index]).filter((_) => _.match(/\d{4}.*_(Starts|Achievements)/));
}

function sumKeys({data, keys}) {
  return keys.reduce((acc, key) => (acc + Number.parseFloat(data[key])), 0)
};

export function starts({ data, year = '1718'}) {
  if (data.length === 0) return;
  var yearly = data.reduce(summariser(getKeys({data})), {});
  return sumKeys({ data: yearly, keys: [`${year}_Starts`] });
}

export function populationEstimate({ data }) {
  if (data.length === 0) return;
  const dataKeys = getKeys(data);

  const yearly = data.reduce(summariser(dataKeys), {});
  const starts = sumKeys({ data: yearly, keys: ['1516_Starts', '1617_Starts', '1718_Starts'] });
  const estimatedDropoutRate = sumKeys(({ data: yearly, keys: ['1617_Achievements', '1718_Achievements']})) / sumKeys({ data: yearly, keys: ['1415_Starts', '1516_Starts']});

  return Math.round(starts * estimatedDropoutRate);
}
