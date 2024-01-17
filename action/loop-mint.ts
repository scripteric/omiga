import { Collector } from "../src/collector";
import { buildSelfMintTx } from "../src/inscription";
import { AddressPrefix } from "@nervosnetwork/ckb-sdk-utils";
import { blockchain } from "@ckb-lumos/base";
import {
  CKB_INDEXER,
  CKB_NODE,
  SECP256K1_PRIVATE_KEY,
  Count,
  inscriptionId,
  collector,
  inscriptionInfoCellDep,
  initConfig,
  infoType,
} from "./config";
import { getInscriptionInfoTypeScript } from "../src/constants";
import { append0x } from "../src/utils";
import { InscriptionInfoException } from "../src/exceptions";

const mint = async (index?: number, count?: number) => {
  const address = collector
    .getCkb()
    .utils.privateKeyToAddress(SECP256K1_PRIVATE_KEY, {
      prefix: AddressPrefix.Mainnet,
    });
  console.log("address: ", address);

  // the inscriptionId come from inscription deploy transaction

  const mintLimit = 10;
  const decimal = 8;

  const feeRate = await collector.getFeeRate();

  const rawTx: CKBComponents.RawTransaction = await buildSelfMintTx({
    collector,
    address,
    inscriptionId,
    mintLimit: BigInt(mintLimit) * BigInt(10 ** decimal),
    feeRate: BigInt(feeRate.mean),
    index,
    count,
    infoType,
    inscriptionInfoCellDep,
  });

  const secp256k1Dep: CKBComponents.CellDep = {
    outPoint: {
      txHash:
        "0x71a7ba8fc96349fea0ed3a5c47992e3b4084b031a42264a018e0072e8172e46c",
      index: "0x0",
    },
    depType: "depGroup",
  };
  const witnessArgs = blockchain.WitnessArgs.unpack(
    rawTx.witnesses[0]
  ) as CKBComponents.WitnessArgs;
  let unsignedTx: CKBComponents.RawTransactionToSign = {
    ...rawTx,
    cellDeps: [...rawTx.cellDeps, secp256k1Dep],
    witnesses: [witnessArgs, ...rawTx.witnesses.slice(1)],
  };
  const signedTx = collector.getCkb().signTransaction(SECP256K1_PRIVATE_KEY)(
    unsignedTx
  );

  let txHash = await collector
    .getCkb()
    .rpc.sendTransaction(signedTx, "passthrough");
  console.info(
    `Loop-Index-${index}: Inscription has been minted with tx hash ${txHash}`
  );
};

const batch = async () => {
  let index = 0;
  for (index = 0; index < Count; index++) {
    try {
      await mint(index, Count);
    } catch (error) {
      continue;
    }
  }
};

const run = async () => {
  await initConfig();

  await batch();
  setInterval(async () => {
    await batch();
  }, 100_000);
};

run();
