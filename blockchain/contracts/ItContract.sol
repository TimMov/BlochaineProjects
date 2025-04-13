// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DiplomaRegistry {
    struct Diploma {
        string studentName;
        string universityName;
        uint256 year;
    }

    address public owner;
    uint256 private diplomaCount;
    mapping(uint256 => Diploma) private diplomas;

    event DiplomaAdded(uint256 indexed id, string studentName, string universityName, uint256 year);
    event DiplomaRemoved(uint256 indexed id);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender; // Устанавливаем владельца контракта
    }

    // Функция для добавления диплома
    function addDiploma(
        string calldata _studentName,
        string calldata _universityName,
        uint256 _year
    ) external onlyOwner {
        require(bytes(_studentName).length > 0, "Student name cannot be empty");
        require(bytes(_universityName).length > 0, "University name cannot be empty");
        require(_year >= 1900 && _year <= 2100, "Invalid graduation year");

        diplomas[diplomaCount] = Diploma(_studentName, _universityName, _year);
        emit DiplomaAdded(diplomaCount, _studentName, _universityName, _year);
        diplomaCount++;
    }

    // Функция для получения количества дипломов
    function getDiplomasCount() external view returns (uint256) {
        return diplomaCount;
    }

    // Функция для получения данных диплома по индексу
    function getDiploma(uint256 index) external view returns (string memory, string memory, uint256) {
        require(index < diplomaCount, "Diploma index out of range");
        Diploma storage d = diplomas[index];
        return (d.studentName, d.universityName, d.year);
    }

    // Функция для получения всех дипломов
    function getAllDiplomas() external view returns (Diploma[] memory) {
        Diploma[] memory allDiplomas = new Diploma[](diplomaCount);
        for (uint256 i = 0; i < diplomaCount; i++) {
            allDiplomas[i] = diplomas[i];
        }
        return allDiplomas;
    }

    // Функция для удаления диплома по индексу
    function removeDiploma(uint256 index) external onlyOwner {
        require(index < diplomaCount, "Diploma index out of range");

        // Сдвигаем дипломы в массиве
        for (uint256 i = index; i < diplomaCount - 1; i++) {
            diplomas[i] = diplomas[i + 1];
        }

        delete diplomas[diplomaCount - 1]; // Удаляем последний элемент
        diplomaCount--;
        emit DiplomaRemoved(index);
    }
}
