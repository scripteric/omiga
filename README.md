## Demo

1. Type the `action/config.ts` file to set your own information
2. Execute `action/split.ts` to split `Count` empty cells
3. Execute `action/first-mint.ts` to create Inscription xudt cell
4. Execute `action/loop-mint.ts` to mint Inscription xudt cell
5. Execute `action/transfer.ts` to transfer all Inscription and ckb
6. Execute `action/transfer-ckb.ts` to transfer all ckb
### CMD

```
npm install

npx ts-node action/split.ts

npx ts-node action/first-mint.ts

npx ts-node action/loop-mint.ts

npx ts-node action/transfer.ts

npx ts-node action/transfer-ckb.ts

```

### 使用说明
1. 修改 `action/config.ts` 文件，设置自己的信息

2. 执行 `action/split.ts` 文件，分割 `Count` 个空单元格

3. 执行 `action/first-mint.ts` 文件，创建一个 Inscription xudt 单元格

4. 执行 `action/loop-mint.ts` 文件，循环创建 Inscription xudt 单元格

5. 执行 `action/transfer.ts` 文件，转移所有 Inscription 和 ckb，推荐直接转到joyid里面，方便操作

6. 执行 `action/transfer-ckb.ts` 文件，转移所有ckb，注意，如果ckb全部转移走，Inscription可能会因为ckb不够手续费而无法转移，建议一起转移到joyid

初次运行先修改配置文件，然后依次执行步骤2、3即可，步骤4会循环执行

### 配置文件说明
SECP256K1_PRIVATE_KEY 为私钥，请勿泄露，可以直接从小狐狸导出，记得最前面加上 '0x'

Count 为分割的Cell数量，可以增大并行执行的速度

ChainedCount一个Cell链式执行的次数，太大可能会报错，默认即可

CKB_NODE 为 CKB 主网节点地址

CKB_INDEXER 为 CKB 主网索引节点地址

MaxFeeRate 最大接受的gas fee

TO_ADDRESS 为transfer和transfer-ckb的接收地址，强烈推荐joyid，因为joyid目前对Omiga的支持度比较高

### 注意事项
1. 请勿泄露私钥，尽量使用新地址操作，安全第一


### 自己运行节点可以直接下载[Neuron](https://github.com/nervosnetwork/neuron/releases/tag/v0.112.0)，配置改为
```
export const CKB_NODE = "http://127.0.0.1:8114/rpc";
export const CKB_INDEXER = "http://127.0.0.1:8114";
```
