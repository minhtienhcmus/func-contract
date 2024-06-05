import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, Slice, TupleBuilder } from '@ton/core';

export type AffPoolConfig = {};

export function affPoolConfigToCell(config: AffPoolConfig): Cell {
    return beginCell().endCell();
}

export class AffPool implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new AffPool(address);
    }

    static createFromConfig(config: AffPoolConfig, code: Cell, workchain = 0) {
        const data = affPoolConfigToCell(config);
        const init = { code, data };
        return new AffPool(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }
    async getAffAddress(provider: ContractProvider) {
        const result = await provider.get('get_aff_data', []);
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
            queryId:number;
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
    async sendAddReward(
        provider: ContractProvider,
        via: Sender,
        value: bigint,
        opts: {
            queryId: number;
            key: bigint;
            // value: Slice;
            // validUntil: bigint;
            owner_address:  Address;
            amount: bigint;
        }
    ) {
        const data = beginCell()
        .storeAddress(opts.owner_address)
        .storeUint(opts.amount,64)
        .endCell();
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0xab418819, 32)
                .storeUint(opts.queryId, 64)
                .storeUint(opts.key, 256)
                // .storeUint(opts.validUntil, 64)
                .storeRef(data)
                .endCell(),
        });
    }
    async sendStopCampaign(
        provider: ContractProvider,
        via: Sender,
        value: bigint,
        opts: {
            queryId: number;
        }
    ) {

        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x4aa61b24, 32)
                .storeUint(opts.queryId, 64)
                .endCell(),
        });
    }
    async sendPauseCampaign(
        provider: ContractProvider,
        via: Sender,
        value: bigint,
        opts: {
            queryId: number;
        }
    ) {

        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x578403ed, 32)
                .storeUint(opts.queryId, 64)
                .endCell(),
        });
    }
    async sendRestartCampaign(
        provider: ContractProvider,
        via: Sender,
        value: bigint,
        opts: {
            queryId: number;
        }
    ) {

        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(0x1ef0720a, 32)
                .storeUint(opts.queryId, 64)
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
        return {itemOwnerAddress,campaign_budget,jetton_wallet_aff,type_campaign};
    }

    async getUserReward(provider: ContractProvider, key: bigint): Promise<[ Slice]> {
        let builder = new TupleBuilder();
        console.log("key",key)
        builder.writeNumber(key)
        const result = await provider.get('get_user_reward',builder.build());
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
        return {itemOwnerAddress,campaign_budget};
    }
}
