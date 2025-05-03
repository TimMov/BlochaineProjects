// contracts/DiplomaContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DiplomaContract {
    struct Diploma {
        string studentName;
        string universityName;
        uint256 year;
        string diplomaHash;
        string diplomaSeries;
        string diplomaNumber;
        string registrationNumber;
        string specialty_code;
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
        string memory _diplomaHash,
        string memory _diplomaSeries,
        string memory _diplomaNumber,
        string memory _registrationNumber,
        string memory _specialty_code
    ) public {
        require(msg.sender == owner, "Only owner can add diplomas");

        diplomas.push(
            Diploma(
                _studentName,
                _universityName,
                _year,
                _diplomaHash,
                _diplomaSeries,
                _diplomaNumber,
                _registrationNumber,
                _specialty_code
            )
        );

        emit DiplomaAdded(diplomas.length - 1, _studentName);
    }

    function getDiplomasCount() public view returns (uint256) {
        return diplomas.length;
    }

    function getDiploma(uint256 index) public view returns (
        string memory,
        string memory,
        uint256,
        string memory,
        string memory,
        string memory,
        string memory,
        string memory
    ) {
        require(index < diplomas.length, "Index out of bounds");
        Diploma memory d = diplomas[index];
        return (
            d.studentName,
            d.universityName,
            d.year,
            d.diplomaHash,
            d.diplomaSeries,
            d.diplomaNumber,
            d.specialty_code,
            d.registrationNumber
        );
    }
}
