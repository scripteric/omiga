import {
  addressToScript,
  serializeWitnessArgs,
} from "@nervosnetwork/ckb-sdk-utils";
import { FEE, getJoyIDCellDep } from "../constants";
import { TransferCKBParams } from "../types";
import { calculateTransactionFee } from "./helper";

export const buildTransferCKBTx = async ({
  collector,
  joyID,
  cellDeps,
  address,
  toAddress,
  amount,
  feeRate,
}: TransferCKBParams): Promise<CKBComponents.RawTransaction> => {
  const txFee = feeRate ? calculateTransactionFee(feeRate) : FEE;
  const isMainnet = address.startsWith("ckb");
  const fromLock = addressToScript(address);
  const cells = await collector.getCells({ lock: fromLock });
  if (cells == undefined || cells.length == 0) {
    throw new Error("The from address has no live cells");
  }

  // transfer all ckb
  if (amount == undefined) {
    amount = BigInt(0);
    cells.forEach(function (val, idx, arr) {
      amount! += BigInt(val.output.capacity);
    }, 0);
    amount = amount - txFee;
  }

  const { inputs, capacity: inputCapacity } = collector.collectInputs(
    cells,
    amount!,
    txFee
  );

  const toLock = addressToScript(toAddress);
  let outputs: CKBComponents.CellOutput[] = [];
  if (inputCapacity === amount + txFee) {
    outputs.push({
      capacity: `0x${amount.toString(16)}`,
      lock: toLock,
    });
  } else {
    const changeCapacity = inputCapacity - FEE - amount;
    outputs.push({
      capacity: `0x${changeCapacity.toString(16)}`,
      lock: fromLock,
    });

    outputs.push({
      capacity: `0x${amount.toString(16)}`,
      lock: toLock,
    });
  }
  cellDeps = [...cellDeps];
  if (joyID) {
    cellDeps.push(getJoyIDCellDep(isMainnet));
  }

  const emptyWitness = { lock: "", inputType: "", outputType: "" };
  const rawTx: CKBComponents.RawTransaction = {
    version: "0x0",
    cellDeps,
    headerDeps: [],
    inputs,
    outputs,
    outputsData: outputs.map((_o) => "0x"),
    witnesses: inputs.map((_, i) =>
      i > 0 ? "0x" : serializeWitnessArgs(emptyWitness)
    ),
  };

  return rawTx;
};
