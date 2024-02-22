// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Vault{
    uint256 private balance;
    uint256 private unlockTime;
    address private beneficiary;
    address private creator;

    constructor(uint256 _amount, uint256 _unlockTime, address _beneficiary, address _creator) payable{
        if(_unlockTime < block.timestamp){
            revert();
        }
        if(_beneficiary == address(0)){
            revert ();
        }
        if(_creator == address(0)){
            revert ();
        }
        if(msg.value <= 0){
            revert();
        }
        balance += _amount;
        unlockTime = _unlockTime;
        beneficiary = _beneficiary;
        creator =_creator;
    }

}