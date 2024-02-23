// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "./Vault.sol";

error NO_VAULT();

contract TrustFund {
    mapping(uint256 => address) public indexToVaultAddress;
    Vault[] private vaults;

    event Deposit(address indexed _from, address indexed _to, uint256 _value);
    event CreateVault(address indexed _creator, address indexed _beneficiary, address _vault);

    function createVault(address _beneficiary, uint256 _unlockTime) external payable{
        uint256 _index = vaults.length;
        Vault _vault = new Vault{value: msg.value}(_unlockTime, _beneficiary, msg.sender);
        indexToVaultAddress[_index] = address(_vault);
        vaults.push(_vault);
        emit CreateVault(msg.sender, _beneficiary, address(_vault));
    }

    function addToVault(uint256 _index) external payable {
        if(indexToVaultAddress[_index] == address(0)){
            revert NO_VAULT();
        }
        Vault vault = vaults[_index];
        vault.addToBalance{value: msg.value}();
        emit Deposit(msg.sender, address(vault), msg.value);
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