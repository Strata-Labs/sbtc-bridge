const rpcUrl = "http://localhost:18443/"; // Adjust for your environment
const rpcUser = "setbern";
const rpcPassword = "setbern";

enum RpcMethods {
  generateToAddress = "generatetoaddress",
  getBlockChainInfo = "getblockchaininfo",
  listUnspent = "listunspent",
  listTransactions = "listtransactions",
  createWallet = "createwallet",
  loadWallet = "loadwallet",
  getNewAddress = "getnewaddress",
  getAddressesByLabel = "getaddressesbylabel",
  listLabels = "listlabels",
  listWallets = "listwallets",
  getWalletInfo = "getwalletinfo",
  unloadWallet = "unloadwallet",
  createRawTransaction = "createrawtransaction",
  signRawTransactionWithWallet = "signrawtransactionwithwallet",
  sendRawTransaction = "sendrawtransaction",
  decodeRawTransaction = "decoderawtransaction",
  getTransaction = "gettransaction",
  dumpPrivKey = "dumpprivkey",
  listaddressgroupings = "listaddressgroupings",
  getAddressInfo = "getaddressinfo",
  getWalletDescriptor = "listdescriptors",
  importprivkey = "importprivkey",
  importaddress = "importaddress",
  unloadWallets = "unloadwallets",
  scantxoutset = "scantxoutset",
}

// UTXO type definition
export type UTXO = {
  txid: string;
  vout: number;
  amount: number;
  scriptPubKey: string;
};

const rpcHandlerCore = async (method: RpcMethods, params: any) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization:
      "Basic " + Buffer.from(`${rpcUser}:${rpcPassword}`).toString("base64"),
  };

  const timestamp = Date.now();

  const body = JSON.stringify({
    jsonrpc: "1.0",
    id: `${method}-${timestamp}`,
    method: method,
    params,
  });

  try {
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: headers,
      body: body,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.result;
  } catch (err: any) {
    console.log(`rpcHandlerCore ${method} err`);
    console.log(err);
    throw new Error(err);
  }
};
/* 
  load wallet
*/
// Create wallet function
export const createWallet = async (walletName: string) => {
  return await rpcHandlerCore(RpcMethods.createWallet, [walletName]);
};

export const createInitWallet = async (walletName: string) => {
  return await rpcHandlerCore(RpcMethods.createWallet, [walletName]);
};
/* 
  GenerateToAddress
*/
type GenerateToAddress = {
  nblocks: number;
  address: string;
};

export const generateToAddress = async ({
  address,
  nblocks,
}: GenerateToAddress) => {
  return await rpcHandlerCore(RpcMethods.generateToAddress, [nblocks, address]);
};

/* 
  GetBlockchainInfo
*/
export const getBlockChainInfo = async () => {
  return await rpcHandlerCore(RpcMethods.getBlockChainInfo, []);
};

/* 
  ListUnspent
*/
type ListUnspent = {
  minconf: number;
  maxconf: number;
  addresses: string[];
};
export const listUnspent = async ({
  minconf,
  maxconf,
  addresses,
}: ListUnspent) => {
  try {
    return await rpcHandlerCore(RpcMethods.listUnspent, [
      minconf,
      maxconf,
      addresses,
    ]);
  } catch (err) {
    console.log("listUnspent err");
    console.log(err);
  }
};

type ListTransactionsParams = {
  account?: string; // The account name, or "*" for all accounts
  count?: number; // Number of transactions to return
  skip?: number; // Number of transactions to skip
  includeWatchOnly?: boolean; // Include watch-only addresses
};

export const listTransactions = async ({
  account = "*",
  count = 10,
  skip = 0,
  includeWatchOnly = false,
}: ListTransactionsParams) => {
  return await rpcHandlerCore(RpcMethods.listTransactions, [
    account,
    count,
    skip,
    includeWatchOnly,
  ]);
};

// Function to load a wallet
export const loadWallet = async (walletName: string) => {
  return await rpcHandlerCore(RpcMethods.loadWallet, [walletName]);
};

// Function to create a Taproot address from a loaded wallet
export const createTaprootAddress = async (label: string) => {
  return await rpcHandlerCore(RpcMethods.getNewAddress, [
    createTaprootAddress,
    "bech32",
  ]);
};
// 2. Get a new address from the wallet
export const getNewAddress = async () => {
  return await rpcHandlerCore(RpcMethods.getNewAddress, ["", "bech32"]); // Using "bech32" for SegWit addresses
};

export const getNewAddressByLabel = async (label: string) => {
  return await rpcHandlerCore(RpcMethods.getNewAddress, [label, "bech32"]); // Using "bech32" for SegWit addresses
};

// Example of loading a wallet and generating a Taproot address
const setupTaprootAddress = async (walletName: string) => {
  try {
    // Load the wallet (replace 'mywallet' with your actual wallet name)
    const loadedWallet = await loadWallet(walletName);
    console.log("Wallet loaded:", loadedWallet);

    // Create a Taproot address
    const taprootAddress = await createTaprootAddress(walletName);
    console.log("Taproot Address: ", taprootAddress);
  } catch (err) {
    console.error("Error:", err);
  }
};

export const getAddressesByLabel = async (label: string = "") => {
  return await rpcHandlerCore(RpcMethods.getAddressesByLabel, [label]);
};

export const listLabels = async () => {
  return await rpcHandlerCore(RpcMethods.listLabels, []);
};

export const listWallets = async () => {
  return await rpcHandlerCore(RpcMethods.listWallets, []);
};

export const getWalletInfo = async () => {
  return await rpcHandlerCore(RpcMethods.getWalletInfo, []);
};

export const unloadWallet = async (walletName: string) => {
  return await rpcHandlerCore(RpcMethods.unloadWallet, [walletName]);
};

export const createRawTransaction = async (inputs: any[], outputs: any) => {
  return await rpcHandlerCore(RpcMethods.createRawTransaction, [
    inputs,
    outputs,
  ]);
};

export const signRawTransactionWithWallet = async (hex: string) => {
  return await rpcHandlerCore(RpcMethods.signRawTransactionWithWallet, [hex]);
};

export const sendRawTransaction = async (hex: string) => {
  console.log("hex", hex);
  return await rpcHandlerCore(RpcMethods.sendRawTransaction, [hex]);
};

export const decodeRawTransaction = async (hex: string) => {
  return await rpcHandlerCore(RpcMethods.decodeRawTransaction, [hex]);
};

export const mineBlock = async (address: string, nblocks: number = 1) => {
  return await rpcHandlerCore(RpcMethods.generateToAddress, [nblocks, address]);
};

// Function to check transaction status
export const getTransactionStatus = async (txid: string) => {
  return await rpcHandlerCore(RpcMethods.getTransaction, [txid]);
};

export const dumpPrivKey = async (address: string) => {
  return await rpcHandlerCore(RpcMethods.dumpPrivKey, [address]);
};

export const listAddressGroupings = async () => {
  return await rpcHandlerCore(RpcMethods.listaddressgroupings, []);
};

export const getAddressInfo = async (address: string) => {
  return await rpcHandlerCore(RpcMethods.getAddressInfo, [address]);
};

export const createDescriptorWallet = async (walletName: string) => {
  // Call the createwallet RPC method with descriptors set to true
  return await rpcHandlerCore(RpcMethods.createWallet, [
    walletName, // Name of the wallet
    false, // Disable private keys
    false, // Blank wallet (not needed here)
    "", // Passphrase (if needed)
    false, // Avoid reuse
    true, // Enable descriptors
    false, // No external signer
    false, // Disable private keys in descriptors (set to false to use private keys)
  ]);
};

// Get wallet descriptor information
export const getWalletDescriptor = async () => {
  return await rpcHandlerCore(RpcMethods.getWalletDescriptor, []);
};

export const importPrivKey = async (privKey: string) => {
  return await rpcHandlerCore(RpcMethods.importprivkey, [privKey]);
};

export const importAddress = async (address: string) => {
  return await rpcHandlerCore(RpcMethods.importaddress, [address]);
};

export const scanTxOutSet = async (address: string) => {
  return await rpcHandlerCore(RpcMethods.scantxoutset, ["start", [address]]);
};
