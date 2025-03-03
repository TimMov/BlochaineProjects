// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

contract ItContract {
    string public name = "TimMov";
    string public symbol = "TM";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    // Переименовал переменную balance0f в balanceOf
    mapping (address => uint256) public balanceOf;

    // Оставляем событие с именем Transfer
    event Transfer(address indexed from, address indexed to, uint256 value);

    constructor(uint256 _initialSupply) {
        totalSupply = _initialSupply * 10 ** uint256(decimals);
        balanceOf[msg.sender] = totalSupply;  // Используем balanceOf вместо balance0f
    }

    // Переименовал функцию Transfer в transferTokens
    function transferTokens(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");  // Проверка на достаточность средств
        balanceOf[msg.sender] -= _value;  // Снимаем средства с отправителя
        balanceOf[_to] += _value;  // Добавляем средства получателю
        emit Transfer(msg.sender, _to, _value);  // Генерируем событие Transfer
        return true;
    }
}
