// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./AllowlistGuard.sol";

contract MockSafe {
    event ExecutionSuccess(address to, uint256 value);
    event ExecutionFailure(address to, uint256 value);
    
    address[] public owners;
    uint256 public threshold;
    uint256 public nonce;
    address public guard;
    
    enum Operation { Call, DelegateCall }
    
    constructor(address[] memory _owners, uint256 _threshold) {
        require(_owners.length > 0, "Owners required");
        require(_threshold > 0 && _threshold <= _owners.length, "Invalid threshold");
        owners = _owners;
        threshold = _threshold;
    }
    
    receive() external payable {}
    
    function setGuard(address _guard) external {
        guard = _guard;
    }
    
    function execTransaction(
        address to,
        uint256 value,
        bytes memory data,
        Operation operation,
        uint256 safeTxGas,
        uint256 baseGas,
        uint256 gasPrice,
        address gasToken,
        address payable refundReceiver,
        bytes memory signatures
    ) public payable returns (bool success) {
        if (guard != address(0)) {
            AllowlistGuard(guard).checkTransaction(
                to, value, data,
                AllowlistGuard.Operation(uint8(operation)),
                safeTxGas, baseGas, gasPrice, gasToken,
                refundReceiver, signatures, msg.sender
            );
        }
        
        if (operation == Operation.Call) {
            success = execute(to, value, data, gasleft());
        } else {
            revert("DelegateCall not supported");
        }
        
        if (guard != address(0)) {
            AllowlistGuard(guard).checkAfterExecution(bytes32(0), success);
        }
        
        nonce++;
        
        if (success) {
            emit ExecutionSuccess(to, value);
        } else {
            emit ExecutionFailure(to, value);
        }
        
        return success;
    }
    
    function execute(address to, uint256 value, bytes memory data, uint256 txGas) 
        internal returns (bool success) {
        assembly {
            success := call(txGas, to, value, add(data, 0x20), mload(data), 0, 0)
        }
    }
    
    function getOwners() external view returns (address[] memory) {
        return owners;
    }
    
    function getThreshold() external view returns (uint256) {
        return threshold;
    }
}
