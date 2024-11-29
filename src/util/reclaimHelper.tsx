import { listUnspent } from "./bitcoinClient";

const fetchUtxosForReclaim = async (address: string) => {
  try {
    // fetch from this url
    //beta.sbtc-mempool.tech/api/proxy/address/bcrt1p0xm5zynnnhmmyh0ay3jxjfgq8fv330nqcpxsx47dvcsq2rt79ylscpeyq2/utxo

    const baseUrl = "/api/proxy/address//";

    const productionURL = `${baseUrl}${address}/utxo`;
    const developmentUrl = `/api/utxo?btcAddress=${address}`;

    const url =
      process.env.NODE_ENV === "production" ? productionURL : developmentUrl;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log("listUnspentres", responseData);

    return responseData;
  } catch (err) {
    console.error("Error fetching utxos for reclaim:", err);
  }
};

export const constructUtxoInputForFee = async (
  feeAmount: number,
  address: string
) => {
  try {
    const utxos = await fetchUtxosForReclaim(address);

    console.log("utxos", utxos);
  } catch (err) {}
};
