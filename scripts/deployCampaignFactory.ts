import { Address,toNano } from '@ton/core';
import { CampaignFactory } from '../wrappers/CampaignFactory';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const campaignFactory = provider.open(
        CampaignFactory.createFromConfig(
            {
                owner_address:  provider.sender().address as Address,
                pool_aff:await compile('AffPool'),
                pool_reward:await compile('RewardPool')
            
            },
            await compile('CampaignFactory')
        )
    );

    await campaignFactory.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(campaignFactory.address);

    // console.log('ID', await campaignFactory.getID());

}
