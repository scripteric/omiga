import { AddressPrefix } from "@nervosnetwork/ckb-sdk-utils";
import { SECP256K1_PRIVATE_KEY, collector } from "./config";

const printAddress = () => {
  const address = collector
    .getCkb()
    .utils.privateKeyToAddress(SECP256K1_PRIVATE_KEY, {
      prefix: AddressPrefix.Mainnet,
    });
  console.log("address: ", address);
};

printAddress();
