import {
  addressToScript,
  rawTransactionToHash,
} from "@nervosnetwork/ckb-sdk-utils";
import {
  FEE,
  getXudtDep,
  getInscriptionDep,
  getInscriptionInfoTypeScript,
} from "../constants";
import { ChainedMintParams, MintParams } from "../types";
import {
  calcXudtTypeScript,
  calculateTransactionFee,
  calcSelfMintXudtWitness,
} from "./helper";
import { append0x, leToU128, u128ToLe } from "../utils";
import { InscriptionInfoException } from "../exceptions";

export const buildSelfMintTx = async ({
  collector,
  address,
  inscriptionId,
  mintLimit,
  feeRate,
  index,
  infoType,
  inscriptionInfoCellDep,
}: MintParams): Promise<CKBComponents.RawTransaction> => {
  const isMainnet = address.startsWith("ckb");
  const txFee = feeRate ? calculateTransactionFee(feeRate) : FEE;
  const lock = addressToScript(address);

  const xudtType = calcXudtTypeScript(infoType, isMainnet);

  let cellDeps = [
    getXudtDep(isMainnet),
    getInscriptionDep(isMainnet),
    inscriptionInfoCellDep,
  ];

  const xudtCells = await collector.getCells({ lock, type: xudtType });
  if (!xudtCells || xudtCells.length === 0) {
    throw new InscriptionInfoException(
      "There is no inscription xudt cell with the given inscription id"
    );
  }
  const xudtCell = xudtCells[index ?? 0];
  const inputs = [{ previousOutput: xudtCell.outPoint, since: "0x0" }];
  const outputs = [xudtCell.output];
  const outputCapacity = BigInt(append0x(outputs[0].capacity)) - txFee;
  outputs[0].capacity = `0x${outputCapacity.toString(16)}`;
  const outputsData = [
    append0x(u128ToLe(leToU128(xudtCell.outputData) + mintLimit)),
  ];
  const witnesses = [calcSelfMintXudtWitness(infoType, isMainnet)];

  const rawTx: CKBComponents.RawTransaction = {
    version: "0x0",
    cellDeps,
    headerDeps: [],
    inputs,
    outputs,
    outputsData,
    witnesses,
  };

  return rawTx;
};

export const buildChainedMintTx = async ({
  collector,
  address,
  cellDeps,
  inscriptionId,
  mintLimit,
  feeRate,
  index,
  chainedCount,
  infoType,
}: ChainedMintParams): Promise<CKBComponents.RawTransaction[]> => {
  const isMainnet = address.startsWith("ckb");
  const txFee = feeRate ? calculateTransactionFee(feeRate) : FEE;
  const lock = addressToScript(address);

  const xudtType = calcXudtTypeScript(infoType, isMainnet);

  cellDeps = [...cellDeps, getXudtDep(isMainnet), getInscriptionDep(isMainnet)];

  const xudtCells = await collector.getCells({ lock, type: xudtType });
  if (!xudtCells || xudtCells.length === 0) {
    throw new InscriptionInfoException(
      "There is no inscription xudt cell with the given inscription id"
    );
  }
  const xudtCell = xudtCells[index ?? 0];

  let preOutPoint = xudtCell.outPoint;
  let preAmount = leToU128(xudtCell.outputData);
  let preOutputCapacity = BigInt(xudtCell.output.capacity);

  let rawTxs: CKBComponents.RawTransaction[] = [];
  for (let i = 0; i < chainedCount; i++) {
    const inputs = [{ previousOutput: preOutPoint, since: "0x0" }];
    const outputCapacity = preOutputCapacity - txFee;
    let output: CKBComponents.CellOutput = {
      ...xudtCell.output,
      capacity: `0x${outputCapacity.toString(16)}`,
    };
    const outputs = [output];
    const outputsData = [append0x(u128ToLe(preAmount + mintLimit))];
    const witnesses = [calcSelfMintXudtWitness(infoType, isMainnet)];
    let rawTx: CKBComponents.RawTransaction = {
      version: "0x0",
      cellDeps,
      headerDeps: [],
      inputs,
      outputs,
      outputsData,
      witnesses,
    };

    let rawHash = rawTransactionToHash(rawTx);
    rawTxs.push(rawTx);

    preAmount = preAmount + mintLimit;
    preOutPoint = {
      txHash: rawHash,
      index: `0x0`,
    };
    preOutputCapacity = outputCapacity;
  }

  return rawTxs;
};
