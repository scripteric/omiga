import { Collector } from "../src/collector";
import { getInscriptionInfoTypeScript } from "../src/constants";
import { InscriptionInfoException } from "../src/exceptions";
import { append0x } from "../src/utils";

export const SECP256K1_PRIVATE_KEY = "";
// Split a specified number of cells for minting later
export const Count = 2;
export const ChainedCount = 16;
export const CKB_NODE = "https://mainnet.ckb.dev/rpc";
export const CKB_INDEXER = "https://mainnet.ckb.dev";
export const MaxFeeRate = 30000;
export const TO_ADDRESS = ""
export const Single= 200

export let inscriptionInfoCellDep: CKBComponents.CellDep;
export const inscriptionId =
  "0x55c4075afe3894e6f07e8feea708fc905c42dc4c93ac308f8addde0c04993301";
export const collector = new Collector({
  ckbNodeUrl: CKB_NODE,
  ckbIndexerUrl: CKB_INDEXER,
});

export const infoType: CKBComponents.Script = {
  ...getInscriptionInfoTypeScript(true),
  args: append0x(inscriptionId),
};

export async function initConfig() {
  const inscriptionInfoCells = await collector.getCells({ type: infoType });
  if (!inscriptionInfoCells || inscriptionInfoCells.length === 0) {
    throw new InscriptionInfoException(
      "There is no inscription info cell with the given inscription id"
    );
  }
  inscriptionInfoCellDep = {
    outPoint: inscriptionInfoCells[0].outPoint,
    depType: "code",
  };
}
