import { toNano } from '@ton/core';
import { RewardPool } from '../wrappers/RewardPool';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const rewardPool = provider.open(RewardPool.createFromConfig({}, await compile('RewardPool')));

    await rewardPool.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(rewardPool.address);

    // run methods on `rewardPool`
}
