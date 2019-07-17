export default async function loadJson({ url }) {
  const response = await fetch(url);
  return response.json();
}