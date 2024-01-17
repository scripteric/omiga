export const FEE = BigInt(3000)
export const MAX_TX_SIZE = 2000 // bytes
export const MIN_CAPACITY = BigInt(63) * BigInt(10000_0000)
export const WITNESS_NATIVE_MODE = '01'
export const WITNESS_SUBKEY_MODE = '02'
export const SECP256R1_PUBKEY_SIG_LEN = (1 + 64 + 64) * 2

const TestnetInfo = {
  JoyIDLockScript: {
    codeHash: '0xd23761b364210735c19c60561d213fb3beae2fd6172743719eff6920e020baac',
    hashType: 'type',
    args: '',
  } as CKBComponents.Script,

  JoyIDLockDep: {
    outPoint: {
      txHash: '0x4dcf3f3b09efac8995d6cbee87c5345e812d310094651e0c3d9a730f32dc9263',
      index: '0x0',
    },
    depType: 'depGroup',
  } as CKBComponents.CellDep,

  CotaTypeScript: {
    codeHash: '0x89cd8003a0eaf8e65e0c31525b7d1d5c1becefd2ea75bb4cff87810ae37764d8',
    hashType: 'type',
    args: '0x',
  } as CKBComponents.Script,

  CotaTypeDep: {
    outPoint: {
      txHash: '0x636a786001f87cb615acfcf408be0f9a1f077001f0bbc75ca54eadfe7e221713',
      index: '0x0',
    },
    depType: 'depGroup',
  } as CKBComponents.CellDep,

  InscriptionInfoTypeScript: {
    codeHash: '0x50fdea2d0030a8d0b3d69f883b471cab2a29cae6f01923f19cecac0f27fdaaa6',
    hashType: 'type',
    args: '',
  } as CKBComponents.Script,

  InscriptionInfoDep: {
    outPoint: {
      txHash: '0x7bf3899cf41879ed0319bf5312c9db5bf5620fff9ebe59556c261c48f0369054',
      index: '0x0',
    },
    depType: 'code',
  } as CKBComponents.CellDep,

  InscriptionTypeScript: {
    codeHash: '0x3a241ceceede72a5f55c8fb985652690f09a517d6c9070f0df0d3572fa03fb70',
    hashType: 'type',
    args: '',
  } as CKBComponents.Script,

  InscriptionDep: {
    outPoint: {
      txHash: '0x9101c1db97bc2013ace8ebd0718723be3d0e3748f2ef22bd7f1dbda0ca75d7d0',
      index: '0x0',
    },
    depType: 'code',
  } as CKBComponents.CellDep,

  RebaseTypeScript: {
    codeHash: '0x93043b66bb20797caad0deacaadbada5e58f0893d770ecdddb8806aff8877e29',
    hashType: 'type',
    args: '',
  } as CKBComponents.Script,

  RebaseTypeDep: {
    outPoint: {
      txHash: '0x64ba52275a3012605dda1df52e872b3a1d99009d3b3728beffdfa36d4bdd14b7',
      index: '0x0',
    },
    depType: 'code',
  } as CKBComponents.CellDep,

  XUDTTypeScript: {
    codeHash: '0x25c29dc317811a6f6f3985a7a9ebc4838bd388d19d0feeecf0bcd60f6c0975bb',
    hashType: 'type',
    args: '',
  } as CKBComponents.Script,

  XUDTTypeDep: {
    outPoint: {
      txHash: '0xbf6fb538763efec2a70a6a3dcb7242787087e1030c4e7d86585bc63a9d337f5f',
      index: '0x0',
    },
    depType: 'code',
  } as CKBComponents.CellDep,
}

const MainnetInfo = {
  JoyIDLockScript: {
    codeHash: '0xd00c84f0ec8fd441c38bc3f87a371f547190f2fcff88e642bc5bf54b9e318323',
    hashType: 'type',
    args: '',
  } as CKBComponents.Script,

  JoyIDLockDep: {
    outPoint: {
      txHash: '0xf05188e5f3a6767fc4687faf45ba5f1a6e25d3ada6129dae8722cb282f262493',
      index: '0x0',
    },
    depType: 'depGroup',
  } as CKBComponents.CellDep,

  CotaTypeScript: {
    codeHash: '0x1122a4fb54697cf2e6e3a96c9d80fd398a936559b90954c6e88eb7ba0cf652df',
    hashType: 'type',
    args: '0x',
  } as CKBComponents.Script,

  CotaTypeDep: {
    outPoint: {
      txHash: '0xabaa25237554f0d6c586dc010e7e85e6870bcfd9fb8773257ecacfbe1fd738a0',
      index: '0x0',
    },
    depType: 'depGroup',
  } as CKBComponents.CellDep,

  InscriptionInfoTypeScript: {
    codeHash: '0x5c33fc69bd72e895a63176147c6ab0bb5758d1c7a32e0914f99f9ec1bed90d41',
    hashType: 'type',
    args: '',
  } as CKBComponents.Script,

  InscriptionInfoDep: {
    outPoint: {
      txHash: '0xff05722676d73dafe712004cbc02fe625cb06a74e26d512485bba0962bf49520',
      index: '0x0',
    },
    depType: 'code',
  } as CKBComponents.CellDep,

  InscriptionTypeScript: {
    codeHash: '0x7490970e6af9b9fe63fc19fc523a12b2ec69027e6ae484edffb97334f74e8c97',
    hashType: 'type',
    args: '',
  } as CKBComponents.Script,

  InscriptionDep: {
    outPoint: {
      txHash: '0xd0576d843c36dbad70b1ae92e8600fcdbaf14d6606eb0beadb71a5b3b52dfff7',
      index: '0x0',
    },
    depType: 'code',
  } as CKBComponents.CellDep,

  RebaseTypeScript: {
    codeHash: '0xda8fbf9b8497c0a34fad89377026e51128817c60167a2b7673b27c1a3f2a331f',
    hashType: 'type',
    args: '',
  } as CKBComponents.Script,

  RebaseTypeDep: {
    outPoint: {
      txHash: '0x28edf58d9610cee1536eaf6c151aa31ff91b23cb507ee1dad82a1c56b9250835',
      index: '0x0',
    },
    depType: 'code',
  } as CKBComponents.CellDep,

  XUDTTypeScript: {
    codeHash: '0x50bd8d6680b8b9cf98b73f3c08faf8b2a21914311954118ad6609be6e78a1b95',
    hashType: 'data1',
    args: '',
  } as CKBComponents.Script,

  XUDTTypeDep: {
    outPoint: {
      txHash: '0xc07844ce21b38e4b071dd0e1ee3b0e27afd8d7532491327f39b786343f558ab7',
      index: '0x0',
    },
    depType: 'code',
  } as CKBComponents.CellDep,
}

export const getJoyIDLockScript = (isMainnet = false) =>
  isMainnet ? MainnetInfo.JoyIDLockScript : TestnetInfo.JoyIDLockScript
export const getJoyIDCellDep = (isMainnet = false) => (isMainnet ? MainnetInfo.JoyIDLockDep : TestnetInfo.JoyIDLockDep)

export const getCotaTypeScript = (isMainnet = false) =>
  isMainnet ? MainnetInfo.CotaTypeScript : TestnetInfo.CotaTypeScript
export const getCotaCellDep = (isMainnet = false) => (isMainnet ? MainnetInfo.CotaTypeDep : TestnetInfo.CotaTypeDep)

export const getInscriptionInfoTypeScript = (isMainnet = false) =>
  isMainnet ? MainnetInfo.InscriptionInfoTypeScript : TestnetInfo.InscriptionInfoTypeScript
export const getInscriptionInfoDep = (isMainnet = false) =>
  isMainnet ? MainnetInfo.InscriptionInfoDep : TestnetInfo.InscriptionInfoDep

export const getInscriptionTypeScript = (isMainnet = false) =>
  isMainnet ? MainnetInfo.InscriptionTypeScript : TestnetInfo.InscriptionTypeScript
export const getInscriptionDep = (isMainnet = false) =>
  isMainnet ? MainnetInfo.InscriptionDep : TestnetInfo.InscriptionDep

export const getRebaseTypeScript = (isMainnet = false) =>
  isMainnet ? MainnetInfo.RebaseTypeScript : TestnetInfo.RebaseTypeScript
export const getRebaseDep = (isMainnet = false) => (isMainnet ? MainnetInfo.RebaseTypeDep : TestnetInfo.RebaseTypeDep)

export const getXudtTypeScript = (isMainnet = false) =>
  isMainnet ? MainnetInfo.XUDTTypeScript : TestnetInfo.XUDTTypeScript
export const getXudtDep = (isMainnet = false) => (isMainnet ? MainnetInfo.XUDTTypeDep : TestnetInfo.XUDTTypeDep)
