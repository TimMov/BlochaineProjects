// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

contract ItContract {
    string public name = "TimMov";
    string public symbol = "TM";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    mapping (address => uint256) public balance0f;

    event Transfer(address indexed from, address indexed to, uint256 value);

    constructor(uint256 _initialSupply){

        totalSupply = _initialSupply * 10 ** uint256(decimals);
        balance0f[msg.sender] = totalSupply;

    }

    function transferToken(address _to, uint256 _value) public returns (bool success){

        require(balance0f[msg.sender] >= _value);  
        balance0f[msg.sender] -= _value;  
        balance0f[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;

    }
}