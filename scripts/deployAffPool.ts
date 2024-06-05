import { toNano } from '@ton/core';
import { AffPool } from '../wrappers/AffPool';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const affPool = provider.open(AffPool.createFromConfig({}, await compile('AffPool')));

    await affPool.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(affPool.address);

    // run methods on `affPool`
}
