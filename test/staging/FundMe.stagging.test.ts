import { assert } from "chai";
import { ethers, getNamedAccounts, network } from "hardhat";
import { Address } from "hardhat-deploy/types";
import { DEVELOPMENT_CHAINS } from "../../helper-hardhat-config";
import { FundMe } from "../../typechain-types/contracts/FundMe";

DEVELOPMENT_CHAINS.includes(network.config.chainId!)
  ? describe.skip
  : describe("FundMe", () => {
      let fundMe: FundMe;
      let deployer: Address;
      const sendValue = ethers.parseEther("1");

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        fundMe = await ethers.getContract("FundMe", deployer);
      });

      it("allows people to fund and withdraw", async () => {
        await fundMe.fund({ value: sendValue });
        await fundMe.withdraw();
        const endingBalance = await ethers.provider.getBalance(
          fundMe.getAddress()
        );

        assert.equal(endingBalance.toString(), "0");
      });
    });
