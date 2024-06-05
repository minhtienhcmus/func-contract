import { Address, toNano } from '@ton/core';
import { DemoCoin } from '../wrappers/DemoCoin';
import { NetworkProvider, sleep } from '@ton/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('DemoCoin address'));

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const demoCoin = provider.open(DemoCoin.createFromAddress(address));

    const counterBefore = await demoCoin.getCounter();

    await demoCoin.sendIncrease(provider.sender(), {
        increaseBy: 1,
        value: toNano('0.05'),
        amount:toNano('0.05')
    });

    ui.write('Waiting for counter to increase...');

    let counterAfter = await demoCoin.getCounter();
    let attempt = 1;
    while (counterAfter === counterBefore) {
        ui.setActionPrompt(`Attempt ${attempt}`);
        await sleep(2000);
        counterAfter = await demoCoin.getCounter();
        attempt++;
    }
    const data = await demoCoin.getCoins();
    console.log("data",data);
    ui.clearActionPrompt();
    ui.write('Counter increased successfully!');
}
