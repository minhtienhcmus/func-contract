import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { AffPool } from '../wrappers/AffPool';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('AffPool', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('AffPool');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let affPool: SandboxContract<AffPool>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        affPool = blockchain.openContract(AffPool.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await affPool.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: affPool.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and affPool are ready to use
    });
});
