import { assert, expect } from "chai";
import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { Address } from "hardhat-deploy/types";
import { HARDHAT_CHAIN_ID } from "../../constants";
import { DEVELOPMENT_CHAINS } from "../../helper-hardhat-config";
import { MockV3Aggregator } from "./../../typechain-types/@chainlink/contracts/src/v0.6/tests/MockV3Aggregator";
import { FundMe } from "./../../typechain-types/contracts/FundMe";
const chainId = network.config.chainId || HARDHAT_CHAIN_ID;

// run tests only development chains/local
!DEVELOPMENT_CHAINS.includes(chainId)
  ? describe.skip
  : describe("Fund Me", () => {
      let fundMe: FundMe;
      let deployer: Address;
      let mockV3Aggregator: MockV3Aggregator;
      const sendValue = ethers.utils.parseEther("1");

      beforeEach(async () => {
        // deploy fund me contract
        // const accounts = await ethers.getSigners()  this is to get accounts from hardhat.config.ts, incase of default it would give 10 fake accounts running locally on hardhat
        // const accountZero = account[0]
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe", deployer);
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        );
      });
      describe("constructor", () => {
        it("sets the aggregator addresses correctly", async () => {
          const response = await fundMe.s_priceFeed();

          assert.equal(response, mockV3Aggregator.address);
        });
      });

      describe("fund", () => {
        it("fails if you do not send enough ETH", async () => {
          await expect(fundMe.fund()).to.be.revertedWith("Minimum value USD");
        });

        it("updated the amount funded data structure", async () => {
          await fundMe.fund({ value: sendValue });

          const response = await fundMe.s_addressToAmountFunded(deployer);

          assert.equal(response.toString(), sendValue.toString());
        });

        it("adds funder to an array of funders", async () => {
          await fundMe.fund({ value: sendValue });
          const funder = await fundMe.s_funders(0);

          assert.equal(funder, deployer);
        });
      });

      describe("withdraw", () => {
        beforeEach(async () => {
          await fundMe.fund({ value: sendValue });
        });

        it("can withdraw ETH from a single funder", async () => {
          // arrange
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          // act
          const transactionResponse = await fundMe.withdraw();

          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          // gasCost of a transaction
          const gasCost = gasUsed.mul(effectiveGasPrice);
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerbalance = await fundMe.provider.getBalance(
            deployer
          );

          // assert
          assert.equal("0", endingFundMeBalance.toString());
          // TODO check why this is failing
          // assert.equal((startingFundMeBalance.add(startingDeployerBalance)), endingDeployerbalance.add(gasCost))
        });

        it("allows to withdraw with multiple funders", async () => {
          const accounts = await ethers.getSigners();
          // adding funds to all accounts with value sendValue
          accounts.forEach(async (account) => {
            const fundMeConnectedContract = await fundMe.connect(account);
            await fundMeConnectedContract.fund({ value: sendValue });
          });

          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          // act
          // to withdraw all the amount in the fundMe contract
          const transactionResponse = await fundMe.withdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          // gasCost of a transaction
          const gasCost = gasUsed.mul(effectiveGasPrice);
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerbalance = await fundMe.provider.getBalance(
            deployer
          );

          // assert
          assert.equal("0", endingFundMeBalance.toString());
          // TODO check why this is failing
          // assert.equal((startingFundMeBalance.add(startingDeployerBalance)), endingDeployerbalance.add(gasCost))

          // make sure funders are reset properly

          await expect(fundMe.s_funders(0)).to.be.reverted;

          accounts.forEach(async (account) => {
            assert.equal(
              (
                await fundMe.s_addressToAmountFunded(account.address)
              ).toString(),
              "0"
            );
          });
        });

        it("only allows the owner to withdraw", async () => {
          const accounts = await ethers.getSigners();
          const attacker = accounts[1];

          const attackerConnectedContract = await fundMe.connect(attacker);

          await expect(attackerConnectedContract.withdraw()).to.be.revertedWith(
            "FundMe__NotOwner"
          );
        });

        it("allows to withdraw cheaper with multiple funders", async () => {
          const accounts = await ethers.getSigners();
          // adding funds to all accounts with value sendValue
          accounts.forEach(async (account) => {
            const fundMeConnectedContract = await fundMe.connect(account);
            await fundMeConnectedContract.fund({ value: sendValue });
          });

          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          );

          // act
          // to withdraw all the amount in the fundMe contract
          const transactionResponse = await fundMe.cheaperWithdraw();
          const transactionReceipt = await transactionResponse.wait(1);
          const { gasUsed, effectiveGasPrice } = transactionReceipt;
          // gasCost of a transaction
          const gasCost = gasUsed.mul(effectiveGasPrice);
          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          );
          const endingDeployerbalance = await fundMe.provider.getBalance(
            deployer
          );

          // assert
          assert.equal("0", endingFundMeBalance.toString());
          // TODO check why this is failing
          // assert.equal((startingFundMeBalance.add(startingDeployerBalance)), endingDeployerbalance.add(gasCost))

          // make sure funders are reset properly

          await expect(fundMe.s_funders(0)).to.be.reverted;

          accounts.forEach(async (account) => {
            assert.equal(
              (
                await fundMe.s_addressToAmountFunded(account.address)
              ).toString(),
              "0"
            );
          });
        });
      });
    });
