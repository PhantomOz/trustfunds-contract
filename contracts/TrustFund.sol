// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TrustFund {
    mapping(address => mapping(address => Vault)) public donorToVault;
    mapping(address => Vault) public beneficiaryTobalance;

    struct Vault {
        uint256 _amount;
        uint256 _unlock;
        bool isCreated;
    }

    function createVault(address _beneficiary, uint256 _unlockTime) external payable{
        if(_unlockTime < block.timestamp){
            revert();
        }
        if(_beneficiary == address(0)){
            revert ();
        }
        if(msg.value <= 0){
            revert();
        }
        if(donorToVault[msg.sender][_beneficiary].isCreated){
            revert ();
        }

    }
}