import {
  addressToScript,
  blake160,
  serializeScript,
  serializeWitnessArgs,
} from "@nervosnetwork/ckb-sdk-utils";
import {
  FEE,
  getJoyIDCellDep,
  getInscriptionInfoTypeScript,
  getCotaTypeScript,
  getXudtDep,
  MIN_CAPACITY,
} from "../constants";
import {
  Hex,
  RebasedTransferParams,
  SubkeyUnlockReq,
  TransferParams,
} from "../types";
import { calcXudtTypeScript, calculateTransactionFee } from "./helper";
import { append0x } from "../utils";
import { InscriptionXudtException, NoCotaCellException } from "../exceptions";

export const buildTransferTx = async ({
  collector,
  address,
  inscriptionId,
  cellDeps,
  cellCount,
  toAddress,
  feeRate,
}: TransferParams): Promise<CKBComponents.RawTransaction> => {
  const txFee = feeRate ? calculateTransactionFee(feeRate) : FEE;
  const isMainnet = address.startsWith("ckb");
  const infoType = {
    ...getInscriptionInfoTypeScript(isMainnet),
    args: append0x(inscriptionId),
  };
  const xudtType = calcXudtTypeScript(infoType, isMainnet);
  const fromLock = addressToScript(address);
  const toLock = addressToScript(toAddress);
  const fromLockCapacity =
    (fromLock.codeHash.length - 2) / 2 + (fromLock.args.length - 2) / 2 + 1;
  const toLockCapacity =
    (toLock.codeHash.length - 2) / 2 + (toLock.args.length - 2) / 2 + 1;

  const diff = (toLockCapacity - fromLockCapacity) * 100_000_000;

  const xudtCells = await collector.getCells({
    lock: fromLock,
    type: xudtType,
  });
  if (!xudtCells || xudtCells.length === 0) {
    throw new InscriptionXudtException("The address has no xudt cells");
  }
  const plainCkbCells = await collector.getCells({ lock: fromLock });

  let inputCapacity = BigInt(0);
  let inputs: CKBComponents.CellInput[] = [];
  let outputs: CKBComponents.CellOutput[] = [];
  let outputsData: Hex[] = [];
  if (cellCount && cellCount > 1) {
    const count = Math.min(cellCount, xudtCells.length);
    for (let index = 0; index < count; index++) {
      inputCapacity += BigInt(xudtCells[index].output.capacity);
      inputs.push({ previousOutput: xudtCells[index].outPoint, since: "0x0" });
      let output: CKBComponents.CellOutput = {
        ...xudtCells[index].output,
        lock: toLock,
      };
      output.capacity = `0x${(BigInt(output.capacity) + BigInt(diff)).toString(
        16
      )}`;
      outputs.push(output);
      outputsData.push(xudtCells[index].outputData);
    }
  } else {
    inputCapacity += BigInt(xudtCells[0].output.capacity);
    inputs.push({ previousOutput: xudtCells[0].outPoint, since: "0x0" });
    let output: CKBComponents.CellOutput = {
      ...xudtCells[0].output,
      lock: toLock,
    };
    output.capacity = `0x${(BigInt(output.capacity) + BigInt(diff)).toString(
      16
    )}`;
    outputs.push(output);
    outputsData.push(xudtCells[0].outputData);
  }
  cellDeps = [...cellDeps, getXudtDep(isMainnet)];

  let outputCapacity = BigInt(0);
  outputs.forEach((value, index) => {
    outputCapacity += BigInt(value.capacity);
  });

  let inputPlainCKBCapacity = BigInt(0);
  plainCkbCells?.forEach((value, index) => {
    inputs.push({ previousOutput: value.outPoint, since: "0x0" });
    inputPlainCKBCapacity += BigInt(value.output.capacity);
  });

  console.log(inputCapacity, outputCapacity, inputPlainCKBCapacity, txFee)

  outputs.push({
    capacity: `0x${(
      inputPlainCKBCapacity +
      inputCapacity -
      outputCapacity -
      txFee
    ).toString(16)}`,
    lock: toLock,
  });
  outputsData.push("0x");

  const emptyWitness = { lock: "", inputType: "", outputType: "" };
  let witnesses = [serializeWitnessArgs(emptyWitness)];

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

export const buildRebasedTransferTx = async ({
  collector,
  joyID,
  address,
  rebasedXudtType,
  cellCount,
  toAddress,
  feeRate,
}: RebasedTransferParams): Promise<CKBComponents.RawTransaction> => {
  const txFee = feeRate ? calculateTransactionFee(feeRate) : FEE;
  const isMainnet = address.startsWith("ckb");
  const lock = addressToScript(address);
  const rebasedXudtCells = await collector.getCells({
    lock,
    type: rebasedXudtType,
  });
  if (!rebasedXudtCells || rebasedXudtCells.length === 0) {
    throw new InscriptionXudtException("The address has no rebased xudt cells");
  }

  let inputs: CKBComponents.CellInput[] = [];
  let outputs: CKBComponents.CellOutput[] = [];
  let outputsData: Hex[] = [];
  if (cellCount && cellCount > 1) {
    const count = Math.min(cellCount, rebasedXudtCells.length);
    for (let index = 0; index < count; index++) {
      inputs.push({
        previousOutput: rebasedXudtCells[index].outPoint,
        since: "0x0",
      });
      outputs.push({
        ...rebasedXudtCells[index].output,
        lock: addressToScript(toAddress),
      });
      outputsData.push(rebasedXudtCells[index].outputData);
    }
  } else {
    inputs.push({ previousOutput: rebasedXudtCells[0].outPoint, since: "0x0" });
    outputs.push({
      ...rebasedXudtCells[0].output,
      lock: addressToScript(toAddress),
    });
    outputsData.push(rebasedXudtCells[0].outputData);
  }
  outputs[0].capacity = append0x(
    (BigInt(append0x(outputs[0].capacity)) - txFee).toString(16)
  );

  let cellDeps = [getJoyIDCellDep(isMainnet), getXudtDep(isMainnet)];

  const emptyWitness = { lock: "", inputType: "", outputType: "" };
  let witnesses = [serializeWitnessArgs(emptyWitness)];
  if (joyID && joyID.connectData.keyType === "sub_key") {
    const pubkeyHash = append0x(
      blake160(append0x(joyID.connectData.pubkey), "hex")
    );
    const req: SubkeyUnlockReq = {
      lockScript: serializeScript(lock),
      pubkeyHash,
      algIndex: 1, // secp256r1
    };
    const { unlockEntry } = await joyID.aggregator.generateSubkeyUnlockSmt(req);
    const emptyWitness = {
      lock: "",
      inputType: "",
      outputType: append0x(unlockEntry),
    };
    witnesses[0] = serializeWitnessArgs(emptyWitness);

    const cotaType = getCotaTypeScript(isMainnet);
    const cotaCells = await collector.getCells({ lock, type: cotaType });
    if (!cotaCells || cotaCells.length === 0) {
      throw new NoCotaCellException("Cota cell doesn't exist");
    }
    const cotaCell = cotaCells[0];
    const cotaCellDep: CKBComponents.CellDep = {
      outPoint: cotaCell.outPoint,
      depType: "code",
    };
    cellDeps = [cotaCellDep, ...cellDeps];
  }
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
