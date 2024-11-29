"use client";

type RpcResponse = {
  result: any;
};

type ListTransactionsParams = {
  account?: string; // The account name, or "*" for all accounts
  count?: number; // Number of transactions to return
  skip?: number; // Number of transactions to skip
  includeWatchOnly?: boolean; // Include watch-only addresses
};

// Generic function to make API requests to your Bitcoin RPC API route
const rpcRequest = async (
  rpcMethod: string,
  params: any[] = [],
): Promise<any> => {
  const response = await fetch("/api/bitcoind", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      rpcMethod,
      params,
    }),
  });

  const data: RpcResponse = await response.json();
  return data.result;
};

// Example function to get blockchain info
export const getBlockchainInfo = async (): Promise<any> => {
  return await rpcRequest("getblockchaininfo", []);
};

// Example function to create a new wallet
export const createWallet = async (walletName: string): Promise<any> => {
  return await rpcRequest("createwallet", [walletName]);
};

// Function to generate blocks to an address
export const generateToAddress = async (
  address: string,
  nblocks = 1,
): Promise<any> => {
  return await rpcRequest("generatetoaddress", [nblocks, address]);
};

// Function to list unspent transactions
export const listUnspent = async (
  minconf = 1,
  maxconf = 9999999,
  addresses: string[] = [],
): Promise<any> => {
  return await rpcRequest("listunspent", [minconf, maxconf, addresses]);
};

// Function to create a raw transaction
export const createRawTransaction = async (
  inputs: any[],
  outputs: any,
): Promise<any> => {
  return await rpcRequest("createrawtransaction", [inputs, outputs]);
};

// Function to sign a raw transaction
export const signRawTransactionWithWallet = async (
  hex: string,
): Promise<any> => {
  return await rpcRequest("signrawtransactionwithwallet", [hex]);
};

// Function to send a raw transaction
export const sendRawTransaction = async (hex: string): Promise<any> => {
  return await rpcRequest("sendrawtransaction", [hex]);
};

// Function to decode a raw transaction
export const decodeRawTransaction = async (hex: string): Promise<any> => {
  return await rpcRequest("decoderawtransaction", [hex]);
};

// Function to mine blocks to an address
export const mineBlock = async (address: string, nblocks = 1): Promise<any> => {
  return await rpcRequest("generatetoaddress", [nblocks, address]);
};

// Function to check transaction status
export const getTransactionStatus = async (txid: string): Promise<any> => {
  return await rpcRequest("gettransaction", [txid, false, true]);
};

// Function to dump the private key of an address
export const dumpPrivKey = async (address: string): Promise<any> => {
  return await rpcRequest("dumpprivkey", [address]);
};

// Function to list address groupings
export const listAddressGroupings = async (): Promise<any> => {
  return await rpcRequest("listaddressgroupings", []);
};

// Function to get address info
export const getAddressInfo = async (address: string): Promise<any> => {
  return await rpcRequest("getaddressinfo", [address]);
};

// Function to create a descriptor wallet
export const createDescriptorWallet = async (
  walletName: string,
): Promise<any> => {
  return await rpcRequest("createwallet", [
    walletName,
    false, // Disable private keys
    false, // Blank wallet
    "", // Passphrase
    false, // Avoid reuse
    true, // Enable descriptors
    false, // No external signer
    false, // Disable private keys in descriptors
  ]);
};

// Function to get wallet descriptor information
export const getWalletDescriptor = async (): Promise<any> => {
  return await rpcRequest("listdescriptors", []);
};

// Function to import a private key
export const importPrivKey = async (privKey: string): Promise<any> => {
  return await rpcRequest("importprivkey", [privKey]);
};

// Function to import an address
export const importAddress = async (address: string): Promise<any> => {
  return await rpcRequest("importaddress", [address]);
};

// Function to scan the UTXO set for an address
export const scanTxOutSet = async (address: string): Promise<any> => {
  return await rpcRequest("scantxoutset", [
    "start",
    [{ desc: `addr(${address})`, range: 10000 }],
  ]);
};

// Function to test mempool accept for a raw transaction
export const testMempoolAccept = async (rawTx: string): Promise<any> => {
  return await rpcRequest("testmempoolaccept", [[rawTx]]);
};

// Function to get the block hash by height
export const getBlockHash = async (blockHeight: number): Promise<any> => {
  return await rpcRequest("getblockhash", [blockHeight]);
};

// Function to get the block by its hash
export const getBlock = async (blockHash: string): Promise<any> => {
  return await rpcRequest("getblock", [blockHash]);
};

// Function to get a raw transaction
export const getRawTransaction = async (txid: string): Promise<any> => {
  return await rpcRequest("getrawtransaction", [txid, true]);
};

// Function to create a Taproot address
export const createTaprootAddress = async (label: string): Promise<any> => {
  return await rpcRequest("getnewaddress", [label, "bech32"]);
};

// Function to get addresses by label
export const getAddressesByLabel = async (label: string = ""): Promise<any> => {
  return await rpcRequest("getaddressesbylabel", [label]);
};

// Function to get blockchain info
export const getBlockChainInfo = async (): Promise<any> => {
  return await rpcRequest("getblockchaininfo", []);
};

// Function to get a new SegWit address
export const getNewAddress = async (): Promise<any> => {
  return await rpcRequest("getnewaddress", ["", "bech32"]);
};

// Function to get a new SegWit address by label
export const getNewAddressByLabel = async (label: string): Promise<any> => {
  return await rpcRequest("getnewaddress", [label, "bech32"]);
};

// Function to get wallet info
export const getWalletInfo = async (): Promise<any> => {
  return await rpcRequest("getwalletinfo", []);
};

// Function to list labels in the wallet
export const listLabels = async (): Promise<any> => {
  return await rpcRequest("listlabels", []);
};

// Function to list transactions
export const listTransactions = async ({
  account = "*",
  count = 10,
  skip = 0,
  includeWatchOnly = false,
}: ListTransactionsParams): Promise<any> => {
  return await rpcRequest("listtransactions", [
    account,
    count,
    skip,
    includeWatchOnly,
  ]);
};

// Function to list all loaded wallets
export const listWallets = async (): Promise<any> => {
  return await rpcRequest("listwallets", []);
};

// Function to load a wallet
export const loadWallet = async (walletName: string): Promise<any> => {
  return await rpcRequest("loadwallet", [walletName]);
};

// Function to unload a wallet
export const unloadWallet = async (walletName: string): Promise<any> => {
  return await rpcRequest("unloadwallet", [walletName]);
};
