import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { RewardPool } from '../wrappers/RewardPool';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('RewardPool', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('RewardPool');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let rewardPool: SandboxContract<RewardPool>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        rewardPool = blockchain.openContract(RewardPool.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await rewardPool.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: rewardPool.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and rewardPool are ready to use
    });
});
