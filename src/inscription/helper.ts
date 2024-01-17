import {
  scriptToHash,
  serializeScript,
  serializeWitnessArgs,
} from '@nervosnetwork/ckb-sdk-utils'
import BigNumber from 'bignumber.js'
import { append0x, remove0x } from '../utils'
import { getXudtTypeScript, getInscriptionTypeScript, MAX_TX_SIZE } from '../constants'

export const generateOwnerScript = (inscriptionInfoScript: CKBComponents.Script, isMainnet: boolean) => {
  return {
    ...getInscriptionTypeScript(isMainnet),
    args: append0x(scriptToHash(inscriptionInfoScript)),
  } as CKBComponents.Script
}

export const calcXudtTypeScript = (inscriptionInfoScript: CKBComponents.Script, isMainnet: boolean) => {
  const ownerScript = generateOwnerScript(inscriptionInfoScript, isMainnet)
  return {
    ...getXudtTypeScript(isMainnet),
    args: append0x(scriptToHash(ownerScript)),
  } as CKBComponents.Script
}

export const calcXudtHash = (inscriptionInfoScript: CKBComponents.Script, isMainnet: boolean) => {
  return scriptToHash(calcXudtTypeScript(inscriptionInfoScript, isMainnet))
}


export const calcMintXudtWitness = (inscriptionInfoScript: CKBComponents.Script, isMainnet: boolean) => {
  const ownerScript = generateOwnerScript(inscriptionInfoScript, isMainnet)
  const owner = remove0x(serializeScript(ownerScript))
  // serialize mint XudtInputWitness
  const witnessOutputType = `0x6d00000014000000690000006900000069000000${owner}04000000`
  const emptyWitness = { lock: '', inputType: '', outputType: witnessOutputType }
  return serializeWitnessArgs(emptyWitness)
}

export const calcSelfMintXudtWitness = (inscriptionInfoScript: CKBComponents.Script, isMainnet: boolean) => {
  const ownerScript = generateOwnerScript(inscriptionInfoScript, isMainnet)
  const owner = remove0x(serializeScript(ownerScript))
  // serialize mint XudtInputWitness
  const witnessInputType = `0x6d00000014000000690000006900000069000000${owner}04000000`
  const emptyWitness = { lock: '', inputType: witnessInputType, outputType: '' }
  return serializeWitnessArgs(emptyWitness)
}

export const calculateTransactionFee = (feeRate: bigint, txSize?: number): bigint => {
  const ratio = BigNumber(1000)
  const transactionSize = txSize ?? MAX_TX_SIZE
  const fee = BigNumber(transactionSize).multipliedBy(BigNumber(feeRate.toString())).div(ratio)
  return BigInt(fee.toFixed(0, BigNumber.ROUND_CEIL).toString())
}

const SingleXudtCapacity = 500
const BaseFeeRate = BigInt(1000)
export const calculateRebaseTxFee = (count: number, feeRate?: bigint) => {
  let txSize = 1500
  if (count > 1) {
    txSize += (count - 1) * SingleXudtCapacity
  }
  const rate = feeRate ?? BaseFeeRate
  return calculateTransactionFee(rate, txSize)
}
