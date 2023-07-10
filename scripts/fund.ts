import { ethers, getNamedAccounts } from "hardhat";
import { FundMe } from "../typechain-types/contracts/FundMe";

const main = async () => {
  const { deployer } = await getNamedAccounts();

  const fundMe: FundMe = await ethers.getContract("FundMe", deployer);
  console.log("Funding Contract...");
  const transactionResponse = await fundMe.fund({
    value: ethers.parseEther("0.1"),
  });
  await transactionResponse.wait(1);

  console.log("Funded...");
};

main();
