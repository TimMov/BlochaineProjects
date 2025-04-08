// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DiplomaRegistry {
    struct Diploma {
        string name;
        string university;
        string year;
    }

    mapping(address => Diploma) public diplomas;

    // Функция для добавления диплома
    function addDiploma(
        address student, 
        string memory name, 
        string memory university, 
        string memory year
    ) public {
        diplomas[student] = Diploma(name, university, year);
    }

    // Функция для получения диплома по адресу
    function getDiploma(address student) public view returns (string memory, string memory, string memory) {
        Diploma memory diploma = diplomas[student];
        return (diploma.name, diploma.university, diploma.year);
    }
}
