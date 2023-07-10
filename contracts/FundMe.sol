// SPDX-License-Identifier: MIT

pragma solidity ^0.8.8;

import "./PriceConverter.sol";

error FundMe__NotOwner();

/** @title A contract for crowd funding
 *  @author Saikrishna Sangishetty
 *  @notice this contract is to demo a simple funding contract
 *  @dev This implements price feeds as our library
 *
 */
// Get funds from users
// withdraw funds
// Set a minimum funding value in USD
contract FundMe {
    // Type Declarations
    using PriceConverter for uint256;

    // State variables
    uint256 public constant MINIMUM_USD = 50 * 1e18;
    // smart contract addresses can hold funds just like wallets
    address[] public s_funders; // vairable with s_ prepended are the storage variables
    mapping(address => uint256) public s_addressToAmountFunded;

    address public immutable i_owner;
    AggregatorV3Interface public s_priceFeed;

    modifier onlyOwner() {
        // require(msg.sender == i_owner, "Sender is not owner!");
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _; // this is to represent to execute the rest of the code of function if above is passed.
    }

    constructor(address priceFeedAddress) {
        // this is called immediately when ever this contract is deployed
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    // what happens if someone sends this contract ETH without calling the fund function
    // receive()

    // receive() external payable {
    //     fund();
    // }

    // fallback() external payable {
    //     fund();
    // }

    /**
     * @notice This function funds this contract
     */
    function fund() public payable {
        // set min amount to fund in USD
        //  msg.value is in terms of ETH and MINIMUM_USD in US dollar.
        //  How to convert and compare to validate ? this is where we use decentralized Oracles like ChainLink

        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "Minimum value USD"
        ); // 1e18 = 1 * 10 ** 18 == 1000000000000000000 1ETH = 1e18
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {
        // starting index, ending index, step amount
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        //  reset the array
        s_funders = new address[](0); // it resets the funders array
        //  actually withdraw the funds

        // "transfer", the max gas fee is 2300, so if transaction need more gas this will error and reverts the transaction
        // payable(msg.sender).transfer(address(this/*refers the current contract i.e; FundMe*/).balance /*FundMe contract balance*/);

        // "send", the max gas fee is 2300, so if transaction need more gas this will return bool false, or true if success, this wont revert
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // manual revert of transaction
        // require(sendSuccess, "Send failed");

        // "call", there is cap on gas fee, it calls some other function, it returns if call to function success and the data returned by the function
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        // manual revert of transaction
        require(callSuccess, "Call failed");
    }

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders;

        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }
}
