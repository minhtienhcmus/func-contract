import { Address, toNano } from '@ton/core';
import { CampaignFactory } from '../wrappers/CampaignFactory';
import { NetworkProvider, sleep } from '@ton/blueprint';
import { AffPool } from '../wrappers/AffPool';
import { InfoEntry, RewardPool } from '../wrappers/RewardPool';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('CampaignFactory address'));

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const affPool = provider.open(RewardPool.createFromAddress(address));

    const hashInt = hashStringToInt(('0QDE0iKpkaZl5-ZpkluwHRNm9ffUnVN-EllkIm61zqoMX660'));
    console.log("hashInt",hashInt)
    const entries: InfoEntry[] = [
        {
            address: Address.parse('0QDE0iKpkaZl5-ZpkluwHRNm9ffUnVN-EllkIm61zqoMX660'),
            amount: toNano('130'),
            key: BigInt(3897827822)
        },
        {
            address: Address.parse('0QBuKnv23FRVXI0faZjhKkhviaiTmx_Bu65POcTYILLLboVo'),
            amount: toNano('210'),
            key: BigInt(608965960)
        },
    ];
    await affPool.sendAddRewardUser(provider.sender(), toNano('0.03'), {
        queryId: (Date.now()),
        entries: entries
    });

    ui.write('Waiting for affPool to increase...');

    // let counterAfter = await couter.getCounter();
    // let attempt = 1;
    // while (counterAfter === counterBefore) {
    //     ui.setActionPrompt(`Attempt ${attempt}`);
    //     await sleep(2000);
    //     counterAfter = await couter.getCounter();
    //     attempt++;
    // }

    ui.clearActionPrompt();
    ui.write('Counter affPool successfully!');
}
function hashStringToInt(str: string) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return hash >>> 0; // Ensure the hash is a positive integer
}