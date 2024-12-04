export default async function getTokenPrice(token: string) {
  const response = await fetch(`https://api.coincap.io/v2/assets/${token}`);
  const json = await response.json();
  return Number(json.data.priceUsd);
}
