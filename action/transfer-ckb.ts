import { Collector } from "../src/collector";
import {
  buildFirstMintTx,
  buildTransferCKBTx,
  buildTransferTx,
} from "../src/inscription";
import { AddressPrefix, addressToScript } from "@nervosnetwork/ckb-sdk-utils";
import { blockchain } from "@ckb-lumos/base";
import {
  CKB_INDEXER,
  CKB_NODE,
  SECP256K1_PRIVATE_KEY,
  TO_ADDRESS,
} from "./config";

const transfer = async () => {
  const collector = new Collector({
    ckbNodeUrl: CKB_NODE,
    ckbIndexerUrl: CKB_INDEXER,
  });
  const address = collector
    .getCkb()
    .utils.privateKeyToAddress(SECP256K1_PRIVATE_KEY, {
      prefix: AddressPrefix.Mainnet,
    });
  console.log("address: ", address);
  console.log(
    "args_len: ",
    addressToScript(address).args.length,
    addressToScript(address).codeHash.length
  );

  const secp256k1Dep: CKBComponents.CellDep = {
    outPoint: {
      txHash:
        "0x71a7ba8fc96349fea0ed3a5c47992e3b4084b031a42264a018e0072e8172e46c",
      index: "0x0",
    },
    depType: "depGroup",
  };

  const rawTx: CKBComponents.RawTransaction = await buildTransferCKBTx({
    collector,
    address,
    cellDeps: [secp256k1Dep],
    toAddress: TO_ADDRESS,
  });

  const witnessArgs = blockchain.WitnessArgs.unpack(
    rawTx.witnesses[0]
  ) as CKBComponents.WitnessArgs;
  let unsignedTx: CKBComponents.RawTransactionToSign = {
    ...rawTx,
    witnesses: [witnessArgs, ...rawTx.witnesses.slice(1)],
  };
  const signedTx = collector.getCkb().signTransaction(SECP256K1_PRIVATE_KEY)(
    unsignedTx
  );

  let txHash = await collector
    .getCkb()
    .rpc.sendTransaction(signedTx, "passthrough");
  console.info(`Transfer inscription to ${TO_ADDRESS} with tx hash ${txHash}`);
};

transfer();
