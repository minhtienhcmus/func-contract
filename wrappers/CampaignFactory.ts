import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, TupleBuilder } from '@ton/core';

export type CampaignFactoryConfig = {
    owner_address: Address;
    pool_aff: Cell;
    pool_reward: Cell;

};

export function campaignFactoryConfigToCell(config: CampaignFactoryConfig): Cell {
    return beginCell().storeAddress(config.owner_address)
        .storeRef(config.pool_aff)
        .storeRef(config.pool_reward)
        .endCell();
}

export const Opcodes = {
    increase: 0x7e8764ef,
};

export class CampaignFactory implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) { }

    static createFromAddress(address: Address) {
        return new CampaignFactory(address);
    }

    static createFromConfig(config: CampaignFactoryConfig, code: Cell, workchain = 0) {
        const data = campaignFactoryConfigToCell(config);
        const init = { code, data };
        return new CampaignFactory(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(), //.storeUint(1, 32).storeUint(0, 64)
        });
    }

    async sendCreateCampaign(
        provider: ContractProvider,
        via: Sender,
        opts: {
            jetton_wallet_aff: Address;
            jetton_wallet_reward: Address;
            campaign_budget: bigint;
            amount_reward: bigint;
            type_campaign: bigint;
            itemOwnerAddress: Address;
            value: bigint;
            // itemContent: string;
            amount: bigint;
            queryId:number;
            key: number;
        }
    ) {
        // const nftContent = beginCell();
        // nftContent.storeBuffer(Buffer.from(opts.itemContent));

        const affpool = beginCell();
        affpool.storeAddress(opts.itemOwnerAddress);
        affpool.storeUint(opts.campaign_budget,64);
        affpool.storeAddress(opts.jetton_wallet_aff);
        affpool.storeUint(opts.type_campaign,8);

        const rewardPool = beginCell();
        rewardPool.storeAddress(opts.itemOwnerAddress);
        rewardPool.storeUint(opts.amount_reward,64);
        rewardPool.storeAddress(opts.jetton_wallet_reward);
        rewardPool.storeUint(opts.type_campaign,8);
        console.log("amount==",opts.amount);
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(1, 32)
                .storeUint(opts.queryId, 64)
                .storeUint(opts.key,64)
                .storeCoins(opts.amount)
                .storeRef(affpool)
                .storeRef(rewardPool)
                .endCell(),
        });
    }
    async getPoolAddress(provider: ContractProvider) {
        const result = await provider.get('get_pool_address', []);
        return result.stack.readAddress();
    }
    async getOwnerAddress(provider: ContractProvider) {
        const result = await provider.get('get_owner_address', []);
        return result.stack.readAddress();
    }
    async getJettonAddress(provider: ContractProvider) {
        const result = await provider.get('get_jetton_address', []);
        return result.stack.readAddress();
    }

    async getAmount(provider: ContractProvider) {
        const result = await provider.get('get_amount', []);
        return result.stack.readNumber();
    }

    async getPoolCAddress(provider: ContractProvider,key: number ) {
        let builder = new TupleBuilder();
        builder.writeNumber(key)

        const result = await provider.get('get_pool_address_by_key', builder.build());
        // console.log(result.stack)
        return {
            aff_pool: result.stack.readAddress(),
            reward_pool: result.stack.readAddress()
        };
    }
    // async getID(provider: ContractProvider) {
    //     const result = await provider.get('get_id', []);
    //     return result.stack.readNumber();
    // }

}
