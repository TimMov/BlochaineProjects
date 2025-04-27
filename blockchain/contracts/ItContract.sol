// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DiplomaRegistry {
    struct Diploma {
        string studentName;
        string universityName;
        uint256 year;
        uint256 timestamp;
    }

    address public owner;
    uint256 private diplomaCount;
    mapping(uint256 => Diploma) private diplomas;
    mapping(bytes32 => bool) private diplomaHashes; // Для проверки уникальности

    event DiplomaAdded(
        uint256 indexed id,
        string studentName,
        string universityName,
        uint256 year,
        uint256 timestamp,
        bytes32 diplomaHash
    );

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // Добавление диплома с проверкой уникальности
    function addDiploma(
        string calldata _studentName,
        string calldata _universityName,
        uint256 _year
    ) external onlyOwner {
        require(bytes(_studentName).length > 0, "Empty student name");
        require(bytes(_universityName).length > 0, "Empty university name");
        require(_year >= 1900 && _year <= block.timestamp / 31536000 + 1970, "Invalid year");

        bytes32 hash = keccak256(abi.encodePacked(
            _studentName,
            _universityName,
            _year
        ));
        
        require(!diplomaHashes[hash], "Diploma already exists");
        
        diplomas[diplomaCount] = Diploma(
            _studentName,
            _universityName,
            _year,
            block.timestamp
        );
        
        diplomaHashes[hash] = true;
        
        emit DiplomaAdded(
            diplomaCount,
            _studentName,
            _universityName,
            _year,
            block.timestamp,
            hash
        );
        
        diplomaCount++;
    }

    // Безопасная передача владения
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    // Оптимизированная функция получения диплома
    function getDiploma(uint256 index) external view returns (
        string memory,
        string memory,
        uint256,
        uint256
    ) {
        require(index < diplomaCount, "Invalid index");
        Diploma storage d = diplomas[index];
        return (d.studentName, d.universityName, d.year, d.timestamp);
    }

    // Получение количества дипломов (оставлено без изменений)
    function getDiplomasCount() external view returns (uint256) {
        return diplomaCount;
    }

    // Проверка существования диплома по хэшу
    function isDiplomaExists(
        string calldata _studentName,
        string calldata _universityName,
        uint256 _year
    ) external view returns (bool) {
        bytes32 hash = keccak256(abi.encodePacked(
            _studentName,
            _universityName,
            _year
        ));
        return diplomaHashes[hash];
    }
}