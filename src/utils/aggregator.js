export default function aggregator({ data }) {
  if (data.length === 0) return;
  const sum = data
    .map(_ => Number.parseFloat(_['1718_Achievements']))
    .filter(_ => _)
    .reduce((p, c) => p + c, 0);
  return sum;
}
