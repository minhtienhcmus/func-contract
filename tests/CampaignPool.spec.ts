import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { CampaignPool } from '../wrappers/CampaignPool';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('CampaignPool', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('CampaignPool');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let campaignPool: SandboxContract<CampaignPool>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        campaignPool = blockchain.openContract(CampaignPool.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await campaignPool.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: campaignPool.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and campaignPool are ready to use
    });
});
