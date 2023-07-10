import { DEVELOPMENT_CHAINS } from './../helper-hardhat-config';
import { HARDHAT_CHAIN_ID } from "../constants";
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';


const DECIMALS = "18"
const INITIAL_PRICE = "1000000000000000000000" // 1000

export const deployMocks: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { getNamedAccounts, deployments, network } = hre;
    const { deploy, log } = deployments

    const { deployer } = await getNamedAccounts();

    const chainId = network.config.chainId || HARDHAT_CHAIN_ID;

    if (DEVELOPMENT_CHAINS.includes(chainId)) {
        log("Local network detected, Deploying mocks...!")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE]
        })
        log("Mocks Deployed!")
        log("----------------------------------")
        log(
            "You are deploying to a local network, you'll need a local network running to interact"
        )
        log(
            "Please run `yarn hardhat console` to interact with the deployed smart contracts!"
        )
        log("----------------------------------")
    }
}
export default deployMocks;
deployMocks.tags = ["all", "mocks"]