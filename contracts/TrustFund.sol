// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "./Vault.sol";

error NO_VAULT();

contract TrustFund {
    mapping(uint256 => address) public indexToVaultAddress;
    Vault[] private vaults;

    

    function createVault(address _beneficiary, uint256 _unlockTime) external payable{
        uint256 _index = vaults.length;
        Vault _vault = new Vault{value: msg.value}(_unlockTime, _beneficiary, msg.sender);
        indexToVaultAddress[_index] = address(_vault);
        vaults.push(_vault);
    }

    function addToVault(uint256 _index) external payable {
        if(indexToVaultAddress[_index] == address(0)){
            revert NO_VAULT();
        }
        Vault vault = vaults[_index];
        vault.addToBalance{value: msg.value}();
    }

    function withdrawFromVault(uint256 _index) external {
        if(indexToVaultAddress[_index] == address(0)){
            revert NO_VAULT();
        }
        Vault vault = vaults[_index];
        vault.withdraw();
    }

    function getVaultDetails(uint256 _index) external view returns(uint256, uint256, address, address){
        if(indexToVaultAddress[_index] == address(0)){
            revert NO_VAULT();
        }
        Vault vault = vaults[_index];
        return vault.getDetails();
    }

}