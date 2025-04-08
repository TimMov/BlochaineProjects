const { expect } = require("chai");

describe("DiplomaRegistry", function () {
    let DiplomaRegistry;
    let diplomaRegistry;
    let deployer;

    beforeEach(async function () {
        [deployer] = await ethers.getSigners();

        // Разворачиваем контракт
        DiplomaRegistry = await ethers.getContractFactory("DiplomaRegistry");
        diplomaRegistry = await DiplomaRegistry.deploy(); // Убираем `.deployed()`, т.к. уже используем await
        console.log("DiplomaRegistry deployed to:", diplomaRegistry.address);
    });

    it("should deploy the contract and add diploma", async function () {
        const studentAddress = "0x1234567890abcdef1234567890abcdef12345678"; // Пример адреса
        const name = "Diploma #1";
        const university = "University XYZ";
        const year = "2025";

        // Добавляем диплом
        await diplomaRegistry.addDiploma(studentAddress, name, university, year);

        // Проверяем, что диплом добавлен
        const [diplomaName, diplomaUniversity, diplomaYear] = await diplomaRegistry.getDiploma(studentAddress);
        expect(diplomaName).to.equal(name);
        expect(diplomaUniversity).to.equal(university);
        expect(diplomaYear).to.equal(year);
    });
});
