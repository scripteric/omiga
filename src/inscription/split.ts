import {
  addressToScript,
  serializeWitnessArgs,
} from '@nervosnetwork/ckb-sdk-utils'
import {
  MIN_CAPACITY,
} from '../constants'
import { CapacityNotEnoughException, NoLiveCellException } from '../exceptions'
import { Collector } from '../collector'



export const buildSplitTx = async (collector: Collector, address: string, cellCount: number, SingleCapacity: bigint): Promise<CKBComponents.RawTransaction> => {
  const txFee = BigInt(80000)
  const lock = addressToScript(address)
  const cells = await collector.getCells({ lock })
  if (!cells || cells.length === 0) {
    throw new NoLiveCellException('The address has no live cells')
  }

  const needCapacity = SingleCapacity * BigInt(cellCount)

  const { inputs, capacity: inputCapacity } = collector.collectInputs(cells, needCapacity, txFee)

  let outputs = []
  let outputsData = []
  for (let i = 0; i < cellCount; i++) {
    outputs.push({
      capacity: `0x${SingleCapacity.toString(16)}`,
      lock,
    })
    outputsData.push('0x')
  }

  const changeCapacity = inputCapacity - txFee - SingleCapacity * BigInt(cellCount)
  if (changeCapacity < MIN_CAPACITY) {
    throw new CapacityNotEnoughException('Not enough capacity for change cell')
  }
  outputs.push({
    capacity: `0x${changeCapacity.toString(16)}`,
    lock,
  })
  outputsData.push('0x')

  const emptyWitness = { lock: '', inputType: '', outputType: '' }
  let witnesses = [serializeWitnessArgs(emptyWitness), '0x']
  const rawTx: CKBComponents.RawTransaction = {
    version: '0x0',
    cellDeps: [],
    headerDeps: [],
    inputs,
    outputs,
    outputsData,
    witnesses,
  }

  return rawTx
}
