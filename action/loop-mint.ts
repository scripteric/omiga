import { Collector } from "../src/collector";
import { buildChainedMintTx, buildSelfMintTx } from "../src/inscription";
import {
  AddressPrefix,
  rawTransactionToHash,
} from "@nervosnetwork/ckb-sdk-utils";
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
  ChainedCount,
  feeRate
} from "./config";
import { getInscriptionInfoTypeScript } from "../src/constants";
import { append0x } from "../src/utils";
import { InscriptionInfoException } from "../src/exceptions";

const sleep = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

const mint = async (index?: number, count?: number) => {
  try {
    const address = collector
      .getCkb()
      .utils.privateKeyToAddress(SECP256K1_PRIVATE_KEY, {
        prefix: AddressPrefix.Mainnet,
      });
    console.log("address: ", address);

    // the inscriptionId come from inscription deploy transaction

    const mintLimit = 10;
    const decimal = 8;
    // 使用动态gasfee
    // const feeRate = await collector.getFeeRate();
    const secp256k1Dep: CKBComponents.CellDep = {
      outPoint: {
        txHash:
          "0x71a7ba8fc96349fea0ed3a5c47992e3b4084b031a42264a018e0072e8172e46c",
        index: "0x0",
      },
      depType: "depGroup",
    };

    const rawTxs: CKBComponents.RawTransaction[] = await buildChainedMintTx({
      collector,
      address,
      inscriptionId,
      mintLimit: BigInt(mintLimit) * BigInt(10 ** decimal),
      feeRate: BigInt(feeRate),
      cellDeps: [secp256k1Dep, inscriptionInfoCellDep],
      chainedCount: ChainedCount,
      index,
      count,
      infoType,
    });

    let lastTxHash: string = "";
    for (let i = 0; i < ChainedCount; i++) {
      const rawHash = rawTransactionToHash(rawTxs[i]);
      console.log("index:", i, "rawHash: ", rawHash);
      const witnessArgs = blockchain.WitnessArgs.unpack(
        rawTxs[i].witnesses[0]
      ) as CKBComponents.WitnessArgs;
      let unsignedTx: CKBComponents.RawTransactionToSign = {
        ...rawTxs[i],
        witnesses: [witnessArgs, ...rawTxs[i].witnesses.slice(1)],
      };
      const signedTx = collector.getCkb().signTransaction(SECP256K1_PRIVATE_KEY)(
        unsignedTx
      );

      let txHash = await collector
        .getCkb()
        .rpc.sendTransaction(signedTx, "passthrough");
      console.info(
        `Loop-Index-${index}-${i}: Inscription has been minted with tx hash ${txHash}, ${rawHash}`
      );

      lastTxHash = txHash;
    }

    for (let i = 0; i < 20; i++) {
      await sleep(5000);
      let txStats = await collector.getTransactionStatus(lastTxHash);
      if (txStats.txStatus.status == "committed") {
        return;
      }
    }
  } catch (error) {
    // 捕获并记录异常
    await sleep(5000);
    console.log(error);
    // 可以选择继续处理或者返回一个标志来表示出现了异常
  }
};

const batch = async () => {
  let index = 0;
  let futs: Promise<void>[] = [];
  for (index = 0; index < Count; index++) {
    futs.push(mint(index, Count));
  }

  for (index = 0; index < Count; index++) {
    await futs[index];
  }
};

const run = async () => {
  await initConfig();

  while (1) {
    try {
      await batch();
    } catch (error) {
      console.log(error)
      await sleep(200000);
      continue;
    }
    await sleep(5000);
  }
};

run();
