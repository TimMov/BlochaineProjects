// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract ItContract {
    struct Diploma {
        address owner;
        string studentName;
        string universityName;
        string year;
    }

    Diploma[] public diplomas;

    function addDiploma(
        address _owner,
        string memory _studentName,
        string memory _universityName,
        string memory _year
    ) public {
        diplomas.push(Diploma(_owner, _studentName, _universityName, _year));
    }

    function getDiplomasCount() public view returns (uint256) {
        return diplomas.length;
    }
}