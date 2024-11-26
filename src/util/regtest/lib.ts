import {
  createTaprootAddress,
  createWallet,
  generateToAddress,
  getBlockChainInfo,
  getNewAddress,
  getNewAddressByLabel,
  listTransactions,
  listUnspent,
  listWallets,
  testMempoolAccept,
  unloadWallet,
} from "../bitcoinClient";
import {
  BitcoinNetwork,
  getP2WSH,
  getPrivateKeysFromSeed,
  privateKeyToWIF,
} from "./wallet";
import { createDepositScriptP2TROutput } from "./depositRequest";

export const startUpFaucet = async () => {
  try {
    // ensure the bitcoind is up and running by checking the chaintip
    const blockChainInfo = await getBlockChainInfo();

    const transactions = await listTransactions({
      account: "*", // Fetch for all accounts
      count: 20, // Fetch the last 20 transactions
      skip: 0, // Skip 0 transactions
      includeWatchOnly: true, // Include watch-only addresses
    });
    return transactions;
  } catch (err: any) {
    throw new Error(err);
  }
};

const startUp2 = async () => {
  try {
    // get currnet blockchain info
    const blockChainInfo = await getBlockChainInfo();
    console.log("blockChainInfo", blockChainInfo);

    const listWalletsRes = await listWallets();
    console.log("listWalletsRes", listWalletsRes);

    const walletName = "sbtcWallet2";
    // const loadLatestWallet = await loadWallet(walletName);

    // console.log("loadLatestWallet", loadLatestWallet);

    const unloadWalletRes = await unloadWallet(walletName);
    console.log("unloadWalletRes", unloadWalletRes);

    const getNewAddressByLabelRes = await getNewAddress();
    console.log("getNewAddressByLabelRes", getNewAddressByLabelRes);

    if (listWalletsRes && listWalletsRes.length > 1) {
      const walletAddress = await getNewAddressByLabel(walletName);
      console.log("walletAddress", walletAddress);

      const genTo = await generateToAddress(walletAddress, 101);

      console.log("genTo", genTo);

      const listUnspentres = await listUnspent(0, 9999999, [walletAddress]);

      console.log("listUnspentres", listUnspentres);
    } else {
      // create a new wallet

      const createWalletRes = await createWallet(walletName);
      console.log("createWalletRes", createWalletRes);
      // get the new address from the wallet
      const newAddy = await createTaprootAddress(walletName);
    }
  } catch (err: any) {
    console.log("err", err);
    throw new Error(err);
  }
};

const checkLoadedWallets = async () => {
  try {
    const listWalletsRes = await listWallets();
    console.log("listWalletsRes", listWalletsRes);
  } catch (err: any) {
    throw new Error(err);
  }
};

const generateToAddressForLoadedWallet = async () => {
  try {
    await checkLoadedWallets();
    const walletAddress = await getNewAddress();
    console.log("walletAddress", walletAddress);
  } catch (err: any) {
    throw new Error(err);
  }
};

const listUnspentFromAddress = async (address: string) => {
  try {
    const listUnspentres = await listUnspent(0, 9999999, [address]);

    console.log("listUnspentres", listUnspentres);
  } catch (err: any) {
    throw new Error(err);
  }
};

export const getTotalBalanceForAddress = async (
  address: string
): Promise<number> => {
  try {
    // Step 1: List unspent UTXOs for the address

    const utxos = await listUnspent(0, 9999999, [address]);

    if (!utxos || utxos.length === 0) {
      throw new Error(`No UTXOs found for address ${address}`);
    }

    // Step 2: Sum the amounts of all UTXOs
    let totalBalance = 0;
    for (const utxo of utxos) {
      totalBalance += utxo.amount; // Add up the amount from each UTXO
    }

    console.log(`Total Balance for ${address}: ${totalBalance} BTC`);
    return totalBalance; // Return the total balance
  } catch (err: any) {
    console.error("Error calculating total balance:", err);
    throw new Error(err);
  }
};

export const DEPOSIT_SEED_PHRASE_DEFAULT = "DEPOSIT_SEED_PHRASE";
export const SIGNER_SEED_PHRASE = "SIGNER_SEED_PHRASE";
export const RECEIVER_SEED_PHRASE = "RECEIVER_SEED_PHRASE";

console.log("test this");
export const createDepositTx = async (
  stxAddress: Uint8Array,
  senderSeedPhrase: string,
  signerPubKey: string,
  amount: number,
  maxFee: number,
  lockTime: number
) => {
  try {
    console.log("createPTRAddress");

    const DEPOSIT_SEED_PHRASE = senderSeedPhrase;

    const privateKey = getPrivateKeysFromSeed(DEPOSIT_SEED_PHRASE);

    const p2wsh = getP2WSH(DEPOSIT_SEED_PHRASE);
    console.log("p2wsh", p2wsh.pubkey);
    //throw new Error("stop");
    const p2wshPrivateKeys = getPrivateKeysFromSeed(DEPOSIT_SEED_PHRASE);

    console.log("testTing", p2wsh.address);
    console.log("p2wshPrivateKeys", p2wshPrivateKeys);

    const network: BitcoinNetwork = "regtest";

    const senderPrivKeyWIF = privateKeyToWIF(privateKey, network);
    // stx

    // Create and sign the Taproot transaction with deposit and reclaim scripts
    const txHex = await createDepositScriptP2TROutput(
      senderPrivKeyWIF,
      p2wsh.address || "",
      stxAddress || "",
      amount,
      signerPubKey,
      maxFee,
      lockTime
    );

    console.log("txHex", txHex);
    // Broadcast the transaction

    //console.log("jig", JSON.stringify(decodedTx, null, 2));
    const testTx = await testMempoolAccept(txHex);
    console.log("testTx", testTx);

    return txHex;

    //return decodedTx;
  } catch (err: any) {
    console.error("Error creating PTR address:", err);
    throw new Error(err);
  }
};

export const createAddress = async (seed: string) => {
  try {
    const p2wsh = getP2WSH(seed);

    return {
      address: p2wsh.address,
      pubkey: p2wsh.pubkey,
    };
  } catch (err: any) {
    throw new Error(err);
  }
};
