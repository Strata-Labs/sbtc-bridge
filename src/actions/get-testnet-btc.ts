"use server";

export async function getHiroTestnetBtc(address: string) {
  const res = await fetch(
    `https://api.testnet.hiro.so/extended/v1/faucets/btc?address=${address}`,
    {
      method: "POST",
    },
  );
  if (res.status !== 200) {
    throw new Error("Error sending BTC");
  }
  return res.json();
}
