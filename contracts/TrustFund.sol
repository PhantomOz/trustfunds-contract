// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "./Vault.sol";


contract TrustFund {
    mapping(address => mapping(address => address)) public donorToVault;
    mapping(address => address) public beneficiaryToVault;

    

    function createVault(address _beneficiary, uint256 _unlockTime) external payable{
        if(donorToVault[msg.sender][_beneficiary] != address(0)){
            revert ();
        }
        Vault vault = new Vault{value: msg.value}(_unlockTime, _beneficiary, msg.sender);
        donorToVault[msg.sender][_beneficiary] = address(vault);
        beneficiaryToVault[_beneficiary] = address(vault);
    }
}