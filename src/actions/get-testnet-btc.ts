"use server";

export async function getHiroTestnetBtc(address: string) {
  const data = await fetch(
    `https://api.testnet.hiro.so/extended/v1/faucets/btc?address=${address}`,
    {
      method: "POST",
    },
  );
  return data.json();
}
