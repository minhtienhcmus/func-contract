import { Address, toNano } from '@ton/core';
import { CampaignFactory } from '../wrappers/CampaignFactory';
import { NetworkProvider, sleep } from '@ton/blueprint';
import { AffPool } from '../wrappers/AffPool';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Pool address'));

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const campaignFactory = provider.open(AffPool.createFromAddress(address));

    // const counterBefore = await couter.getCounter();
    let jettonMaster_address = Address.parse("EQCaZLOBOrH0C-b7Nn5W1Wt6UTCrGdyQ-oVtIJLA6CNmGMKR");
    const key = Date.now();
    console.log("key===",key)
    await campaignFactory.sendChangeOwner(provider.sender(), {
        // jetton_wallet_aff: jettonMaster_address,

        newOwner: Address.parse('0QBuKnv23FRVXI0faZjhKkhviaiTmx_Bu65POcTYILLLboVo'),
        value: toNano('0.05'),
        queryId: Date.now(),

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