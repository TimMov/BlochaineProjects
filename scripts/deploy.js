async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Получаем фабрику контракта
  const DiplomaRegistry = await ethers.getContractFactory("DiplomaRegistry");

  // Разворачиваем контракт и ждем его развертывания
  const diplomaRegistry = await DiplomaRegistry.deploy();
  console.log("Deploying DiplomaRegistry...");
  
  // Убедитесь, что контракт развернут (мы убираем использование `deployed()` в тестах)
  console.log("DiplomaRegistry deployed to:", diplomaRegistry.address);

  // Добавляем диплом для студента
  const studentAddress = "0x1234567890abcdef1234567890abcdef12345678"; // Пример адреса
  const name = "Diploma #1";
  const university = "University XYZ";
  const year = "2025";

  // Вызов функции addDiploma
  const tx = await diplomaRegistry.addDiploma(studentAddress, name, university, year);
  await tx.wait(); // Ждем завершения транзакции
  console.log("Diploma added for student:", studentAddress);
}

// Запуск скрипта
main()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error);
      process.exit(1);
  });
