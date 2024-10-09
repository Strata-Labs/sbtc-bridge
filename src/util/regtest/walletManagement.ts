//walletManagement.ts;

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
  importAddress,
  importPrivKey,
  listAddressGroupings,
  listLabels,
  listTransactions,
  listUnspent,
  listWallets,
  loadWallet,
  mineBlock,
  scanTxOutSet,
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
import { DEPOSIT_SEED_PHRASE } from "./lib";

const WALLET_NAME = "sbtcWallet";

const CURRENT_WORKING_WALLET = "bcrt1qzusdu4q2pzdcu5rhcz4r0u63azkt0d99fyd33q";
const CURRENT_WORKING_SENDER_WALLET =
  "bcrt1pljykrc5rn4t5clpr70qh0qjaehprqazma9kmqg3hgv0pwvrcxtsse2ukfl";
export const startUp = async () => {
  try {
    // get currnet blockchain info
    const blockChainInfo = await getBlockChainInfo();
    console.log("blockChainInfo", blockChainInfo);

    const listWalletsRes = await listWallets();
    console.log("listWalletsRes", listWalletsRes);

    if (listWalletsRes && listWalletsRes.length === 1) {
      const walletAddress = await getNewAddress();
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

      const createWalletRes = await createWallet(WALLET_NAME);
      console.log("createWalletRes", createWalletRes);
      // get the new address from the wallet
      const newAddy = await createTaprootAddress(WALLET_NAME);
    }
  } catch (err: any) {
    console.log("err", err);
    throw new Error(err);
  }
};

const sendFundsBetweenAddresses = async (
  senderAddy: string,
  receiverAddy: string,
  amount: number
) => {
  try {
    // Step 3: List UTXOs for the sender wallet address
    const utxos = await listUnspent({
      minconf: 0,
      maxconf: 9999999,
      addresses: [senderAddy],
    });
    if (utxos.length === 0)
      throw new Error(`No UTXOs available for address ${senderAddy}`);

    let totalInput = 0;
    const inputs = [];
    for (const utxo of utxos) {
      inputs.push({
        txid: utxo.txid,
        vout: utxo.vout,
      });
      totalInput += utxo.amount;
      if (totalInput >= amount) break; // Stop when we have enough inputs
    }

    if (totalInput < amount) throw new Error("Insufficient funds");

    const fee = 0.002; // Example fee (0.0001 BTC)

    // Step 5: Create transaction outputs (including change if necessary)
    const outputs: any = {};
    outputs[receiverAddy] = amount;

    // Add change output if there are leftover BTC

    const change = totalInput - amount - fee;
    if (change > 0) {
      outputs[senderAddy] = change; // Send change back to sender
    }
    console.log("inputs", inputs);

    console.log("Outputs:", outputs);
    // Step 6: Create the raw transaction
    const rawTxHex = await createRawTransaction(inputs, outputs);
    console.log("Raw Transaction Hex:", rawTxHex);

    // Step 7: Sign the raw transaction with the sender's wallet
    const signedTx = await signRawTransactionWithWallet(rawTxHex);
    console.log("Signed Transaction Hex:", signedTx);

    // ensure the transaction is signed and right by decoding it
    const decodedTx = await decodeRawTransaction(signedTx.hex);
    console.log("decodedTx", decodedTx);

    // Step 8: Send the signed transaction to the Bitcoin network
    const txId = await sendRawTransaction(signedTx.hex);
    console.log("Transaction ID:", txId);

    return txId;
  } catch (err: any) {
    throw new Error(err);
  }
};

export const mineAndCheckId = async (txId: string) => {
  try {
    const blockChainInfo = await getBlockChainInfo();
    console.log("blockChainInfo", blockChainInfo);

    await mineBlock(CURRENT_WORKING_WALLET, 20); // Mine 1 block

    const blockChainInfo2 = await getBlockChainInfo();
    console.log("blockChainInfo2", blockChainInfo2);

    // Step 3: Check the status of the transaction
    const txStatus = await getTransactionStatus(txId);
    console.log("Transaction Status:", txStatus);
  } catch (err: any) {
    throw new Error(err);
  }
};

export const sendFundsTest = async () => {
  try {
    // sendFundsBetweenAddresses
    const senderAddy = CURRENT_WORKING_WALLET;
    const receiverAddy = CURRENT_WORKING_SENDER_WALLET;
    const amount = 1;

    const txId = await sendFundsBetweenAddresses(
      senderAddy,
      receiverAddy,
      amount
    );

    await mineAndCheckId(txId);

    const listUnspentres = await listUnspent({
      minconf: 0,
      maxconf: 9999999,
      addresses: [
        "bcrt1pljykrc5rn4t5clpr70qh0qjaehprqazma9kmqg3hgv0pwvrcxtsse2ukfl",
      ],
    });

    console.log("listUnspentres", listUnspentres);
  } catch (err: any) {
    throw new Error(err);
  }
};

export const importPrivKeyHelper = async () => {
  try {
    const network: BitcoinNetwork = "regtest";

    const p2trTing = getP2TR(DEPOSIT_SEED_PHRASE);
    const address = p2trTing.address;

    const privateKey = getPrivateKeyFromP2tr(DEPOSIT_SEED_PHRASE);
    const senderPrivKeyWIF = privateKeyToWIF(privateKey, network);

    const importPrivRes = await importPrivKey(senderPrivKeyWIF);

    console.log("importPrivRes", importPrivRes);
  } catch (err: any) {
    throw new Error(err);
  }
};

export const importAddressHelper = async () => {
  try {
    const network: BitcoinNetwork = "regtest";

    const p2trTing = getP2TR(DEPOSIT_SEED_PHRASE);
    const address = p2trTing.address;

    const resTing = await scanTxOutSet(address || "");
    console.log("resTing", resTing);
    console.log("address", address);
    const importAddressRes = await importAddress(address || "");

    console.log("importAddressRes", importAddressRes);
  } catch (err: any) {
    throw new Error(err);
  }
};
