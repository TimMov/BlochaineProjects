// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DiplomaRegistry {
    struct Diploma {
        string studentName;
        string universityName;
        uint256 year;
    }

    Diploma[] private diplomas;

    event DiplomaAdded(uint256 indexed id, string studentName, string universityName, uint256 year);

    function addDiploma(
        string calldata _studentName,
        string calldata _universityName,
        uint256 _year
    ) external {
        require(bytes(_studentName).length > 0, "Student name cannot be empty");
        require(bytes(_universityName).length > 0, "University name cannot be empty");
        require(_year >= 1900 && _year <= 2100, "Invalid graduation year");

        diplomas.push(Diploma(_studentName, _universityName, _year));
        emit DiplomaAdded(diplomas.length - 1, _studentName, _universityName, _year);
    }

    function getDiplomasCount() external view returns (uint256) {
        return diplomas.length;
    }

    function getDiploma(uint256 index) external view returns (string memory, string memory, uint256) {
        require(index < diplomas.length, "Diploma index out of range");
        Diploma storage d = diplomas[index];
        return (d.studentName, d.universityName, d.year);
    }

    function getAllDiplomas() external view returns (Diploma[] memory) {
        return diplomas;
    }
}
