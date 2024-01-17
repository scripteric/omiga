import { Collector } from '../src/collector'
import { buildSelfMintTx } from '../src/inscription'
import { AddressPrefix } from '@nervosnetwork/ckb-sdk-utils'
import { blockchain } from '@ckb-lumos/base'
import { CKB_INDEXER, CKB_NODE, SECP256K1_PRIVATE_KEY, Count } from './config'

const mint = async (index?: number, count?: number) => {
  const collector = new Collector({
    ckbNodeUrl: CKB_NODE,
    ckbIndexerUrl: CKB_INDEXER,
  })
  const address = collector.getCkb().utils.privateKeyToAddress(SECP256K1_PRIVATE_KEY, { prefix: AddressPrefix.Mainnet })
  console.log('address: ', address)

  // the inscriptionId come from inscription deploy transaction
  const inscriptionId = '0x55c4075afe3894e6f07e8feea708fc905c42dc4c93ac308f8addde0c04993301'
  const mintLimit = 10
  const decimal = 8

  const rawTx: CKBComponents.RawTransaction = await buildSelfMintTx({
    collector,
    address,
    inscriptionId,
    mintLimit: BigInt(mintLimit) * BigInt(10 ** decimal),
    index,
    count
  })

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
  console.info(`Loop-Index-${index}: Inscription has been minted with tx hash ${txHash}`)
}

const batch = async () => {
  let index = 0
  for (index = 0; index < Count; index++) {
    try {
      await mint(index, Count)
    } catch (error) {
      continue
    }
  }
}

const run = async () => {
  await batch()
  setInterval(async () => {
    await batch()
  }, 180_000)
}

run()
