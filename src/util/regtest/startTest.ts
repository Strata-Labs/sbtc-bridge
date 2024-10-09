import { crypto, networks, payments } from "bitcoinjs-lib";
import { HDKey } from "@scure/bip32";
import { sha256 } from "@noble/hashes/sha256";

console.log("network", networks.regtest);

//init();

// we need to create a master "wallet/private key" for each user so they can do as they please and that way we can derive the addresses from the master key for whatever needed
// trying to get as close as possible to the real thing

const createMasterWallet = (seed: string) => {
  console.log("crypto", crypto);
  const seedHash = sha256.create().update(seed).digest();

  const root = HDKey.fromMasterSeed(seedHash);
  console.log("root", root);
  return root;
};

// the idea behind the core handler is that it will be wrapped by the main called function with the type that we would expect

const createAddressFromMasterWallet = (masterWallet: HDKey) => {
  // set the path to dervie the address from
  const path = "m/44/1/0/0/1";
  const derived = masterWallet.derive(path);
  // convert uint8array to buffer
  if (!derived.publicKey) throw new Error("no private key");

  const buffer = Buffer.from(derived.publicKey);

  console.log("buffer", buffer);

  const p2pkh = payments.p2pkh({
    pubkey: buffer,
    network: networks.regtest,
  });

  console.log("p2pkh", p2pkh);
  console.log("p2pkh.address", p2pkh.address);

  const p2pk = payments.p2pk({
    pubkey: buffer,
    network: networks.regtest,
  });

  console.log("p2kh", p2pk);
  //console.log("p2kh.address", p2kh.address);

  if (!p2pk.pubkey) throw new Error("no pubkey");

  // hex to string utf

  // convert buffer to uint8array then to string

  // tap script
  // console.log("pubkeyString", pubkeyString);
  // const p2tr = payments.p2tr({
  //   pubkey: buffer,
  //   network: networks.regtest,
  // });
};

const hdWalletControl = async () => {
  try {
    const masterKey = createMasterWallet("myseed");
    const masterKeyAddress = createAddressFromMasterWallet(masterKey);
  } catch (err) {
    console.log("hdWalletControl err");
    console.log(err);
  }
};

hdWalletControl();

// okay so just to get something going i want to
