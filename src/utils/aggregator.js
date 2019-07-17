export default function aggregator({ data }) {
  if (data.length === 0) return;
  const sum = data.map(_ => Number.parseFloat(_.Index)).reduce((p, c) => p + c, 0);
  return Math.round(sum / data.length);
}
