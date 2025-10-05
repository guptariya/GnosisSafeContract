// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AllowlistGuard {
    event AddressAllowlisted(address indexed target);
    event AddressRemovedFromAllowlist(address indexed target);
    event TransactionChecked(address indexed safe, address indexed to, uint256 value);
    
    address public owner;
    mapping(address => bool) public allowlist;
    
    error NotOwner();
    error AddressNotAllowlisted(address target);
    error ZeroAddress();
    
    enum Operation { Call, DelegateCall }
    
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }
    
    constructor(address _owner, address[] memory _initialAllowlist) {
        if (_owner == address(0)) revert ZeroAddress();
        owner = _owner;
        
        for (uint256 i = 0; i < _initialAllowlist.length; i++) {
            if (_initialAllowlist[i] != address(0)) {
                allowlist[_initialAllowlist[i]] = true;
                emit AddressAllowlisted(_initialAllowlist[i]);
            }
        }
    }
    
    function checkTransaction(
        address to,
        uint256 value,
        bytes memory data,
        Operation operation,
        uint256 safeTxGas,
        uint256 baseGas,
        uint256 gasPrice,
        address gasToken,
        address payable refundReceiver,
        bytes memory signatures,
        address msgSender
    ) external {
        if (!allowlist[to]) {
            revert AddressNotAllowlisted(to);
        }
        emit TransactionChecked(msg.sender, to, value);
    }
    
    function checkAfterExecution(bytes32 hash, bool success) external {}
    
    function addToAllowlist(address target) external onlyOwner {
        if (target == address(0)) revert ZeroAddress();
        allowlist[target] = true;
        emit AddressAllowlisted(target);
    }
    
    function removeFromAllowlist(address target) external onlyOwner {
        allowlist[target] = false;
        emit AddressRemovedFromAllowlist(target);
    }
    
    function batchAddToAllowlist(address[] calldata targets) external onlyOwner {
        for (uint256 i = 0; i < targets.length; i++) {
            if (targets[i] != address(0)) {
                allowlist[targets[i]] = true;
                emit AddressAllowlisted(targets[i]);
            }
        }
    }
    
    function isAllowlisted(address target) external view returns (bool) {
        return allowlist[target];
    }
    
    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return interfaceId == 0x01ffc9a7 || interfaceId == 0xe6d7a83a;
    }
}
