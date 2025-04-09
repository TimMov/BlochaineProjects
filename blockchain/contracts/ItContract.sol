// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ItContract {
    struct Diploma {
        string studentName;
        string universityName;
        uint256 year;
    }
    
    Diploma[] public diplomas;
    
    function addDiploma(
        string memory _studentName, 
        string memory _universityName, 
        uint256 _year
    ) public {
        diplomas.push(Diploma(_studentName, _universityName, _year));
    }
    
    function getDiplomasCount() public view returns (uint256) {
        return diplomas.length;
    }
}