// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TrustFund {
    mapping(address => mapping(address => Vault)) public addressToVault;
    mapping(address => uint256) public balances;

    struct Vault {
        uint256 _amount;
        uint256 _unlock;
    }
}