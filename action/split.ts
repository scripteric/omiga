import { Collector } from '../src/collector'
import {  buildSplitTx } from '../src/inscription'
import { AddressPrefix } from '@nervosnetwork/ckb-sdk-utils'
import { blockchain } from '@ckb-lumos/base'
import { CKB_INDEXER, CKB_NODE, SECP256K1_PRIVATE_KEY, Count } from './config'

const split = async (cellCount: number) => {
  const collector = new Collector({
    ckbNodeUrl: CKB_NODE,
    ckbIndexerUrl: CKB_INDEXER,
  })
  const address = collector.getCkb().utils.privateKeyToAddress(SECP256K1_PRIVATE_KEY, { prefix: AddressPrefix.Mainnet })
  console.log('address: ', address)

  const rawTx = await buildSplitTx(collector, address, cellCount)

  const secp256k1Dep: CKBComponents.CellDep = {
    outPoint: {
      txHash: '0x71a7ba8fc96349fea0ed3a5c47992e3b4084b031a42264a018e0072e8172e46c',
      index: '0x0',
    },
    depType: 'depGroup',
  }
  const witnessArgs = blockchain.WitnessArgs.unpack(rawTx.witnesses[0]) as CKBComponents.WitnessArgs
  let unsignedTx: CKBComponents.RawTransactionToSign = {
    ...rawTx,
    cellDeps: [...rawTx.cellDeps, secp256k1Dep],
    witnesses: [witnessArgs, ...rawTx.witnesses.slice(1)],
  }
  const signedTx = collector.getCkb().signTransaction(SECP256K1_PRIVATE_KEY)(unsignedTx)

  let txHash = await collector.getCkb().rpc.sendTransaction(signedTx, 'passthrough')
  console.info(`Splitting has been finished with tx hash ${txHash}`)
}


split(Count)
