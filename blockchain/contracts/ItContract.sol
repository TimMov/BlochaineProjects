// contracts/DiplomaContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DiplomaContract {
    struct Diploma {
        string studentName;
        string universityName;
        uint256 year;
        string diplomaHash;
    }

    Diploma[] public diplomas;
    address public owner;

    event DiplomaAdded(uint256 indexed id, string studentName);

    constructor() {
        owner = msg.sender;
    }

    function addDiploma(
        string memory _studentName,
        string memory _universityName,
        uint256 _year,
        string memory _diplomaHash
    ) public {
        require(msg.sender == owner, "Only owner can add diplomas");
        diplomas.push(Diploma(_studentName, _universityName, _year, _diplomaHash));
        emit DiplomaAdded(diplomas.length - 1, _studentName);
    }

    // Добавляем этот метод
    function getDiplomasCount() public view returns (uint256) {
        return diplomas.length;
    }

    function getDiploma(uint256 index) public view returns (
        string memory,
        string memory,
        uint256,
        string memory
    ) {
        require(index < diplomas.length, "Index out of bounds");
        Diploma memory d = diplomas[index];
        return (d.studentName, d.universityName, d.year, d.diplomaHash);
    }
}