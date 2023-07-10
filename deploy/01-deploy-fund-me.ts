import { HARDHAT_CHAIN_ID } from './../constants';
import { DeployFunction, DeployOptions } from 'hardhat-deploy/types'
import { DEVELOPMENT_CHAINS, NETWORK_CONFIG } from '../helper-hardhat-config';
import { verifyContract } from './../utils/verify';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

export const deployFundMe: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { getNamedAccounts, deployments, network } = hre;
    const { deploy, log } = deployments

    const { deployer } = await getNamedAccounts();
    log(deployer)
    const chainId = network.config.chainId || HARDHAT_CHAIN_ID;

    let ethUsdPriceFeedAddress: string

    if (chainId === HARDHAT_CHAIN_ID) {
        log('********************Deploying mocks************************')
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = NETWORK_CONFIG[chainId].ethUSDPriceFeedAddress;
    }

    const args = [ethUsdPriceFeedAddress]
    //  when going for localhost or hardhat blockchain we want to use mock 
    const deployOptions = {
        from: deployer,
        args,
        log: true,
        waitConfirmations: NETWORK_CONFIG[chainId]?.blockConfirmations || 1,
    } as DeployOptions
    const fundMe = await deploy("FundMe", deployOptions)
    log(`FundMe deployed at ${fundMe.address}`)
    if (!DEVELOPMENT_CHAINS.includes(chainId) && process.env.ETHERSCAN_API_KEY) {
        // verify
        await verifyContract(fundMe.address, args)
    }
}

export default deployFundMe; // deploys need default export as this will be used while deploying
deployFundMe.tags = ['all', 'fundMe']