import {
  addressToScript,
} from '@nervosnetwork/ckb-sdk-utils'
import {
  FEE,
  getXudtDep,
  getInscriptionDep,
  getInscriptionInfoTypeScript,
} from '../constants'
import { MintParams } from '../types'
import { calcXudtTypeScript, calculateTransactionFee, calcMintXudtWitness } from './helper'
import { append0x, u128ToLe } from '../utils'
import {
  InscriptionInfoException,
  NoLiveCellException,
} from '../exceptions'

export const buildFirstMintTx = async ({
  collector,
  address,
  inscriptionId,
  mintLimit,
  feeRate,
  index,
}: MintParams): Promise<CKBComponents.RawTransaction> => {
  const isMainnet = address.startsWith('ckb')
  const txFee = feeRate ? calculateTransactionFee(feeRate) : FEE
  const lock = addressToScript(address)
  const cells = await collector.getCells({ lock, capacityRange: ['0x34e62ce00', '0x5d21dba00'] })
  if (!cells || cells.length === 0) {
    throw new NoLiveCellException('The address has no specific cells')
  }

  const infoType: CKBComponents.Script = {
    ...getInscriptionInfoTypeScript(isMainnet),
    args: append0x(inscriptionId),
  }
  const inscriptionInfoCells = await collector.getCells({ type: infoType })
  if (!inscriptionInfoCells || inscriptionInfoCells.length === 0) {
    throw new InscriptionInfoException('There is no inscription info cell with the given inscription id')
  }
  const inscriptionInfoCellDep: CKBComponents.CellDep = {
    outPoint: inscriptionInfoCells[0].outPoint,
    depType: 'code',
  }
  const xudtType = calcXudtTypeScript(infoType, isMainnet)

  let cellDeps = [
    getXudtDep(isMainnet),
    getInscriptionDep(isMainnet),
    inscriptionInfoCellDep,
  ]

  const emptyCell = cells[index ?? 0]
  const inputs = [{ previousOutput: emptyCell.outPoint, since: '0x0' }]
  const outputs = [
    {
      ...emptyCell.output,
      type: xudtType,
    },
  ]
  const outputCapacity = BigInt(append0x(outputs[0].capacity)) - txFee
  outputs[0].capacity = `0x${outputCapacity.toString(16)}`
  const outputsData = [append0x(u128ToLe(mintLimit))]
  const witnesses = [calcMintXudtWitness(infoType, isMainnet)]
  
  const rawTx: CKBComponents.RawTransaction = {
    version: '0x0',
    cellDeps,
    headerDeps: [],
    inputs,
    outputs,
    outputsData,
    witnesses,
  }

  return rawTx
}
