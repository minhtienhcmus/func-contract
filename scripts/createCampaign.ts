import { Address, toNano } from '@ton/core';
import { CampaignFactory } from '../wrappers/CampaignFactory';
import { NetworkProvider, sleep } from '@ton/blueprint';
import { Xoffer } from '../wrappers/Xoffer';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('CampaignFactory address'));

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const campaignFactory = provider.open(CampaignFactory.createFromAddress(address));

    // const counterBefore = await couter.getCounter();
    let jetton_minter_address = Address.parse("EQBs72ajelb33oqhaL21YBt9fnahcfCcompubZYQYifoM_aH");
    const token_xoffer = provider.open(Xoffer.createFromAddress(jetton_minter_address));
    const key = Date.now();
    console.log("key===",key)
    const pol = await campaignFactory.getPoolCAddress(key);

    // get jetton wallet affpool
    const aff_pool = await token_xoffer.getWalletAddress(pol.aff_pool);
    const reward_pool = await token_xoffer.getWalletAddress(pol.reward_pool);
    console.log("aff_pooljetton==",aff_pool)
    console.log("reward_pooljetton==",reward_pool)
    console.log("contract add pool===",pol)
    //get jetton wallet rewardPool
    await campaignFactory.sendCreateCampaign(provider.sender(), {
        // jetton_wallet_aff: jettonMaster_address,
        campaign_budget: toNano(2000),
        amount_reward:toNano(3000),
        value: toNano('0.05'),
        amount:  toNano('0.02'),
        queryId: Date.now(),
        itemOwnerAddress: provider.sender().address as Address,
        key: key,
        jetton_wallet_aff:aff_pool,
        jetton_wallet_reward:reward_pool,
        type_campaign: BigInt(62)
    });
    ui.write('Waiting for counter to increase...');

    // let counterAfter = await couter.getCounter();
    // let attempt = 1;
    // while (counterAfter === counterBefore) {
    //     ui.setActionPrompt(`Attempt ${attempt}`);
    //     await sleep(2000);
    //     counterAfter = await couter.getCounter();
    //     attempt++;
    // }

    ui.clearActionPrompt();
    ui.write('Counter increased successfully!');
}