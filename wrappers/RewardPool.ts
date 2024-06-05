import { Address, beginCell, Builder, Cell, Contract, contractAddress, ContractProvider, Dictionary, Sender, SendMode, Slice, toNano, TupleBuilder } from '@ton/core';

export type RewardPoolConfig = {};

export function rewardPoolConfigToCell(config: RewardPoolConfig): Cell {
    return beginCell().endCell();
}

export class RewardPool implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) { }

    static createFromAddress(address: Address) {
        return new RewardPool(address);
    }

    static createFromConfig(config: RewardPoolConfig, code: Cell, workchain = 0) {
        const data = rewardPoolConfigToCell(config);
        const init = { code, data };
        return new RewardPool(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
    async getInfoRewardPool(provider: ContractProvider) {
        const result = await provider.get('get_reward_data', []);
        let a = {
            init: result.stack.readBigNumber(),
            key: result.stack.readBigNumber(),
            campaign_factory: result.stack.readAddress(),
            owner_address: result.stack.readAddress(),
            monitor: result.stack.readAddress(),
            info: this.readDataFromCell(result.stack.readCell()),
            contract: result.stack.readAddress(),
            total_add: result.stack.readBigNumber(),
            status_campaign: result.stack.readBigNumber(),
        }
        return a;
    }
    async sendChangeOwner(
        provider: ContractProvider,
        via: Sender,
        opts: {
            newOwner: Address;
            value: bigint;
            queryId: number;
        }
    ) {
        // const nftContent = beginCell();
        // nftContent.storeBuffer(Buffer.from(opts.itemContent));

        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x21746f75, 32)
                .storeUint(opts.queryId, 64)
                .storeAddress(opts.newOwner)
                .endCell(),
        });
    }
    async sendChangeMonitor(
        provider: ContractProvider,
        via: Sender,
        opts: {
            newOwner: Address;
            value: bigint;
            queryId:number;
        }
    ) {
        // const nftContent = beginCell();
        // nftContent.storeBuffer(Buffer.from(opts.itemContent));

        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0xa81f6ff3, 32)
                .storeUint(opts.queryId, 64)
                .storeAddress(opts.newOwner)
                .endCell(),
        });
    }
    readDataFromCell(cell: Cell): any {
        // Convert the cell into a slice for reading
        const slice = cell.beginParse();

        // Read the first integer (42) with 32 bits
        const itemOwnerAddress = slice.loadAddress();
        console.log(`itemOwnerAddress value: ${itemOwnerAddress}`);

        // Read the second integer (256) with 16 bits
        const campaign_budget = slice.loadUint(64);
        console.log(`campaign_budget value: ${campaign_budget}`);

        const jetton_wallet_aff = slice.loadAddress();
        console.log(`jetton_wallet_aff value: ${jetton_wallet_aff}`);

        const type_campaign = slice.loadUint(8);
        console.log(`jetton_wallet_aff value: ${type_campaign}`);
        return { itemOwnerAddress, campaign_budget, jetton_wallet_aff, type_campaign };
    }
    async getUserReward(provider: ContractProvider, key: bigint): Promise<[Slice]> {
        let builder = new TupleBuilder();
        console.log("key", key)
        builder.writeNumber(key)
        const result = await provider.get('get_user_reward', builder.build());
        return [this.readDataFromCellKey(result.stack.readCell())];
    }

    async getTokenRemain(provider: ContractProvider) {
        const result = await provider.get('get_token_remain', []);
        return result.stack.readNumber();
    }
    
    readDataFromCellKey(cell: Cell): any {
        // Convert the cell into a slice for reading
        const slice = cell.beginParse();

        // Read the first integer (42) with 32 bits
        const itemOwnerAddress = slice.loadAddress();
        // console.log(`itemOwnerAddress value: ${itemOwnerAddress}`);

        // Read the second integer (256) with 16 bits
        const campaign_budget = slice.loadUint(64);

        // console.log(`jetton_wallet_aff value: ${type_campaign}`);
        return { itemOwnerAddress, campaign_budget };
    }
    async sendAddRewardUser(
        provider: ContractProvider,
        via: Sender,
        value: bigint,
        opts: {
            queryId: number;
            // key: bigint;
            // value: Slice;
            // validUntil: bigint;
            // owner_address:  Address;
            // amount: bigint;
            entries: InfoEntry [];
        }
    ) {
        const dict = generateEntriesDictionary(opts.entries);
        const dictCell = beginCell().storeDict(dict).endCell();
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0xfc889398, 32)
                .storeUint(opts.queryId, 64)
                // .storeUint(opts.key, 256)
                // .storeUint(opts.validUntil, 64)
                .storeRef(dictCell)
                .endCell(),
        });
    }
    async sendAddRewardAirdrop(
        provider: ContractProvider,
        via: Sender,
        value: bigint,
        opts: {
            queryId: number;
            // key: bigint;
            // value: Slice;
            // validUntil: bigint;
            // owner_address:  Address;
            // amount: bigint;
            entries: InfoEntry [];
        }
    ) {
        const dict = generateEntriesDictionary(opts.entries);
        const dictCell = beginCell().storeDict(dict).endCell();
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x4df6b26f, 32)
                .storeUint(opts.queryId, 64)
                // .storeUint(opts.key, 256)
                // .storeUint(opts.validUntil, 64)
                .storeRef(dictCell)
                .endCell(),
        });
    }
    async sendClaimReward(
        provider: ContractProvider,
        via: Sender,
        value: bigint,
        opts: {
            queryId: number;
            key: bigint;
            // value: Slice;
            // validUntil: bigint;
            // owner_address:  Address;
            // amount: bigint;
        }
    ) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x855511cc, 32)
                .storeUint(opts.queryId, 64)
                .storeUint(opts.key, 256)
                // .storeUint(opts.validUntil, 64)
                .endCell(),
        });
    }
    async sendClaimRemain(
        provider: ContractProvider,
        via: Sender,
        value: bigint,
        opts: {
            queryId: number;
            // key: bigint;
            // value: Slice;
            // validUntil: bigint;
            // owner_address:  Address;
            // amount: bigint;
        }
    ) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x4b237977, 32)
                .storeUint(opts.queryId, 64)
                // .storeUint(opts.validUntil, 64)
                .endCell(),
        });
    }

}
export type InfoEntry = {
    address: Address;
    amount: bigint;
    key: bigint;
};

export const infoEntryValue = {
    serialize: (src: InfoEntry, buidler: Builder) => {
        buidler.storeAddress(src.address).storeUint(src.amount, 64).storeUint(src.key, 64);
    },
    parse: (src: Slice) => {
        return {
            address: src.loadAddress(),
            amount: BigInt(src.loadUint(64)),
            key: BigInt(src.loadUint(64))
        };
    },
};
export function generateEntriesDictionary(entries: InfoEntry[]): Dictionary<bigint, InfoEntry> {
    let dict: Dictionary<bigint, InfoEntry> = Dictionary.empty(Dictionary.Keys.BigUint(256), infoEntryValue);

    for (let i = 0; i < entries.length; i++) {
        dict.set(BigInt(i), entries[i]);
    }

    return dict;
}


