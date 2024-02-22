// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

error MUST_UNLOCK_IN_THE_FUTURE();
error ADDRESS_CANT_BE_ZERO();
error AMOUNT_CANT_BE_ZERO();
error VAULT_ALREADY_UNLOCK();
error VAULT_STILL_LOCK();
error NOT_A_BENEFACTOR();

contract Vault{
    uint256 private balance;
    uint256 private unlockTime;
    address private beneficiary;
    address private creator;

    constructor(uint256 _unlockTime, address _beneficiary, address _creator) payable{
        if(_unlockTime < block.timestamp){
            revert MUST_UNLOCK_IN_THE_FUTURE();
        }
        if(_beneficiary == address(0)){
            revert ADDRESS_CANT_BE_ZERO();
        }
        if(_creator == address(0)){
            revert ADDRESS_CANT_BE_ZERO();
        }
        if(msg.value <= 0){
            revert AMOUNT_CANT_BE_ZERO();
        }
        balance += msg.value;
        unlockTime = _unlockTime;
        beneficiary = _beneficiary;
        creator =_creator;
    }

    function addToBalance() external payable {
        if(msg.value <= 0){
            revert AMOUNT_CANT_BE_ZERO();
        }
        if(unlockTime < block.timestamp){
            revert VAULT_ALREADY_UNLOCK();
        }
        balance += msg.value;
    }

    function withdraw() external {
        if(unlockTime > block.timestamp){
            revert VAULT_STILL_LOCK();
        }
        if(tx.origin != beneficiary && tx.origin != creator ){
            revert NOT_A_BENEFACTOR();
        }
        (bool s,) = payable(tx.origin).call{value: balance}("");
        require(s);
    }

    function getDetails() external view returns(uint256, uint256, address, address){
        return (balance, unlockTime, beneficiary, creator);
    }

}