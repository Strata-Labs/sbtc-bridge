import * as bitcoin from "bitcoinjs-lib";
import * as bip32 from "bip32";
import {
  Signer,
  SignerAsync,
  ECPairInterface,
  ECPairFactory,
  ECPairAPI,
  TinySecp256k1Interface,
} from "ecpair";
import * as crypto from "crypto";

// You need to provide the ECC library. The ECC library must implement
// all the methods of the `TinySecp256k1Interface` interface.
const tinysecp: TinySecp256k1Interface = require("tiny-secp256k1");
const ECPair: ECPairAPI = ECPairFactory(tinysecp);

import {
  createDescriptorWallet,
  createInitWallet,
  createRawTransaction,
  createTaprootAddress,
  createWallet,
  decodeRawTransaction,
  dumpPrivKey,
  generateToAddress,
  getAddressesByLabel,
  getAddressInfo,
  getBlockChainInfo,
  getNewAddress,
  getNewAddressByLabel,
  getTransactionStatus,
  getWalletDescriptor,
  getWalletInfo,
  listAddressGroupings,
  listLabels,
  listTransactions,
  listUnspent,
  listWallets,
  loadWallet,
  mineBlock,
  sendRawTransaction,
  signRawTransactionWithWallet,
  unloadWallet,
} from "./rpcCommands";
import {
  BitcoinNetwork,
  getP2pkh,
  getP2TR,
  getPrivateKeyFromP2tr,
  privateKeyToWIF,
  uint8ArrayToHexString,
} from "./wallet";
import { createAndSignTaprootTransactionWithScripts } from "./depositRequest";
import {
  importAddressHelper,
  importPrivKeyHelper,
  mineAndCheckId,
  sendFundsTest,
  startUp,
} from "./walletManagement";

const startUpFaucet = async () => {
  try {
    // ensure the bitcoind is up and running by checking the chaintip
    const blockChainInfo = await getBlockChainInfo();

    console.log("blockChainInfo", blockChainInfo);
    // assuming it didn't err out then we can prooced

    // create a faucet wallet
    //const wallet = getP2pkh("faucet");

    // const gen = await generateToAddress({
    //   address: wallet || "",
    //   nblocks: 101,
    // });

    // console.log("gen", gen);
    // console.log("wallet", wallet);
    // if (!wallet) throw new Error("no wallet");

    // console.log("wallet", wallet);

    /*
    // send some coins to the faucet wallet
    const sendToAddress = await generateToAddress({
      address: wallet,
      nblocks: 101,
    });
    */

    // in order to check how much the faucet have we have to get all the unspent utxos for this from block to  to block

    // refetch the blockchain info
    const blockChainInfo2 = await getBlockChainInfo();

    const transactions = await listTransactions({
      account: "*", // Fetch for all accounts
      count: 20, // Fetch the last 20 transactions
      skip: 0, // Skip 0 transactions
      includeWatchOnly: true, // Include watch-only addresses
    });
    console.log("transactions", transactions);
    /*
    const listunspent = await listUnspent({
      minconf: 0,
      maxconf: 9999999,
      addresses: [wallet],
    });

    console.log("listunspent", listunspent);
    */
    //console.log("sendToAddress", sendToAddress);
  } catch (err: any) {
    throw new Error(err);
  }
};

//startUpFaucet();

const createMasterWallet = async () => {
  try {
    const blockChainInfo = await getBlockChainInfo();

    console.log("blockChainInfo", blockChainInfo);
    const fetchedWallet = await loadWallet("initWallet");
    console.log("fetchedWallet", fetchedWallet);

    //const createTaprootAddy = await createTaprootAddress();

    const listTransactionsRes = await listTransactions({
      account: "*",
      count: 10,
      skip: 0,
      includeWatchOnly: true,
    });
    console.log("listTransactionsRes", listTransactionsRes);
    //console.log("createTaprootAddy", createTaprootAddy);
  } catch (err: any) {
    console.log("err", err);

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

    throw new Error("stop");
    const getAddressesByLabelres = await getAddressesByLabel("sbtcWallet");

    const getNewAddressByLabelRes = await getNewAddress();
    console.log("getNewAddressByLabelRes", getNewAddressByLabelRes);
    throw new Error("stop");

    if (listWalletsRes && listWalletsRes.length > 1) {
      const walletAddress = await getNewAddressByLabel(walletName);
      console.log("walletAddress", walletAddress);

      const genTo = await generateToAddress({
        address: walletAddress,
        nblocks: 101,
      });

      console.log("genTo", genTo);

      const listUnspentres = await listUnspent({
        minconf: 0,
        maxconf: 9999999,
        addresses: [walletAddress],
      });

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

const loadedWalletAddress = "bcrt1qgvg8arxt83wyny36g7elnz8mq37rgvwh6d6s52";
const secondWallet = "bcrt1qqtw6azqvurzrrhyrwzlknd5rve4pkgnas3sgc9";

// create a taproot address and send funds to
const createAnotherTapRootAddres = async () => {
  try {
    const walletName = "sbtcWallet";
    const tapRootAddy = await createTaprootAddress(walletName);

    // create a
  } catch (err: any) {
    console.log("err", err);
    throw new Error(err);
  }
};
//startUp();

//startUp2();

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

//checkLoadedWallets();

//generateToAddressForLoadedWallet();

const listUnspentFromAddress = async (address: string) => {
  try {
    const listUnspentres = await listUnspent({
      minconf: 0,
      maxconf: 9999999,
      addresses: [address],
    });

    console.log("listUnspentres", listUnspentres);
  } catch (err: any) {
    throw new Error(err);
  }
};

const listUnspentFromOurWallets = async () => {
  try {
    await listUnspentFromAddress(loadedWalletAddress);
    await listUnspentFromAddress(secondWallet);
  } catch (err: any) {
    throw new Error(err);
  }
};

//listUnspentFromOurWallets();

const txId = "a9a3e5d43a0777f28556ed5a0af4f2c43e4502cc8b8bd18778ae5beb80b6f3e6";

//mineAndCheckId();

//sendFundsTest();

//listUnspentFromOurWallets();

// Function to get all UTXOs for a given address and sum the total balance
const getTotalBalanceForAddress = async (address: string): Promise<number> => {
  try {
    // Step 1: List unspent UTXOs for the address

    const utxos = await listUnspent({
      minconf: 0,
      maxconf: 9999999,
      addresses: [address],
    });

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

//getTotalBalanceForAddress(loadedWalletAddress);
//getTotalBalanceForAddress(secondWallet);

const generateTaprootAddress = (privKeyWIF: string): string => {
  const network = bitcoin.networks.regtest;
  const keyPair = ECPair.fromWIF(privKeyWIF, network);

  const { address } = bitcoin.payments.p2tr({
    pubkey: keyPair.publicKey,
    network,
  });

  return address!;
};

const sendTaprootTransactionWithScripts = async () => {
  //const senderPrivKeyWIF = 'your-private-key-wif';

  const blockChainInfo = await getBlockChainInfo();
  console.log("blockChainInfo", blockChainInfo);

  const listWalletsRes = await listWallets();
  console.log("listWalletsRes", listWalletsRes);

  //const loadWalletRes = await loadWallet("sbtcWallet");
  //console.log("loadWalletRes", loadWalletRes);

  const listAddressGroupingsRes = await listAddressGroupings();

  console.log("listAddressGroupingsRes", listAddressGroupingsRes);

  const getWalletInfoRes = await getWalletInfo();
  console.log("getWalletInfoRes", getWalletInfoRes);

  const getAddressInfoRes = await getAddressInfo(
    "bcrt1qqtw6azqvurzrrhyrwzlknd5rve4pkgnas3sgc9"
  );
  console.log("getAddressInfoRes", getAddressInfoRes);

  const dumpPrivKeyRes = await dumpPrivKey(
    "bcrt1qqtw6azqvurzrrhyrwzlknd5rve4pkgnas3sgc9"
  );

  console.log("dumpPrivKeyRes", dumpPrivKeyRes);
  throw new Error("stop");

  const receiverAddress = secondWallet;
  const signersPublicKey = Buffer.from("your-signer-public-key", "hex"); // Signer's public key
  const amount = 1000000; // 0.01 BTC
  const maxFee = 1000; // Transaction fee
  const lockTime = 50; // Example lock time for CSV

  try {
    // Create and sign the Taproot transaction with deposit and reclaim scripts
    /*
    const txHex = await createAndSignTaprootTransactionWithScripts(
      senderPrivKeyWIF,
      receiverAddress,
      amount,
      signersPublicKey,
      maxFee,
      lockTime
    );

    // Broadcast the transaction
    await broadcastTransaction(txHex);
    */
  } catch (error) {
    console.error("Error sending transaction:", error);
  }
};

//sendTaprootTransactionWithScripts();

// Full flow of creating wallet and dumping private key
export const createWalletAndExportPrivKeys = async () => {
  try {
    // Step 1: Create a new wallet
    const walletName = "sbtcWallet";

    const listWalletsRes = await listWallets();
    console.log("listWalletsRes", listWalletsRes);

    //const createWalletRes = await createDescriptorWallet(walletName);
    //console.log("createWalletRes", createWalletRes);
    const address = "bcrt1qvkvtachn74jukkzea86phk5aq59mtfks9zz4m9";
    // Step 2: Generate a new address
    /*
    const newAddress = await getNewAddressByLabel(walletName);
    console.log("newAddress", newAddress);
      // Step 3: Dump the private key for the generated address
    const privateKey = await dumpPrivKey(newAddress);
    console.log("Private Key:", privateKey);
    */

    const getWalletDescriptorRes = await getWalletDescriptor();
    console.log("getWalletDescriptorRes", getWalletDescriptorRes);

    const addressInfo = await getAddressInfo(address);
    console.log("Address Info:", addressInfo);

    const privateKey = await dumpPrivKey(address);
    console.log("Private Key:", privateKey);
  } catch (err: any) {
    console.error("Error during wallet creation and private key export:", err);
    throw new Error(err);
  }
};

//createWalletAndExportPrivKeys();

export const DEPOSIT_SEED_PHRASE = "DEPOSIT_SEED_PHRASE";
export const SIGNER_SEED_PHRASE = "SIGNER_SEED_PHRASE";
export const RECEIVER_SEED_PHRASE = "RECEIVER_SEED_PHRASE";
const createPTRAddress = async () => {
  try {
    const transactions = await listTransactions({
      account: "*", // Fetch for all accounts
      count: 20, // Fetch the last 20 transactions
      skip: 0, // Skip 0 transactions
      includeWatchOnly: true, // Include watch-only addresses
    });

    const listUnspentres = await listUnspent({
      minconf: 0,
      maxconf: 9999999,
      addresses: [
        "bcrt1pljykrc5rn4t5clpr70qh0qjaehprqazma9kmqg3hgv0pwvrcxtsse2ukfl",
      ],
    });

    //console.log("transactions", transactions);
    console.log("listUnspentres", listUnspentres);

    const p2trTing = getP2TR(DEPOSIT_SEED_PHRASE);
    // console.log("p2trTing", p2trTing);
    // console.log("p2trTing.address", p2trTing.address);

    const privateKey = getPrivateKeyFromP2tr(DEPOSIT_SEED_PHRASE);

    const signerWalletInfo = getP2TR(SIGNER_SEED_PHRASE);

    const receiverWalletInfo = getP2TR(RECEIVER_SEED_PHRASE);
    if (signerWalletInfo.pubkey) {
      const signersPublicKey = signerWalletInfo.pubkey;
      console.log("signersPublicKey", signersPublicKey);
      console.log("privateKey", privateKey);

      if (signersPublicKey === undefined) {
        throw new Error("Signer public key is undefined");
      }
      const network: BitcoinNetwork = "regtest";

      const senderPrivKeyWIF = privateKeyToWIF(privateKey, network);
      const receiverAddress = "ST2QKZ4FKHAH1NQKYKYAYZPY440FEPK7GZ1R5HBP2";
      const amount = 1000000; // 0.01 BTC
      const maxFee = 1000; // Transaction fee
      const lockTime = 50; // Example lock time for CSV

      // Create and sign the Taproot transaction with deposit and reclaim scripts
      const txHex = await createAndSignTaprootTransactionWithScripts(
        senderPrivKeyWIF,
        receiverAddress || "",
        amount,
        signersPublicKey,
        maxFee,
        lockTime,
        p2trTing.address || ""
      );
    }
  } catch (err: any) {
    console.error("Error creating PTR address:", err);
    throw new Error(err);
  }
};

//createPTRAddress();

//startUp();

//sendFundsTest();

const txIdTing =
  "f62fa38a977c0f1676b742303e3e14afc84d13b1f6529066527315140e4c4771";

//mineAndCheckId(txIdTing);

importAddressHelper();
