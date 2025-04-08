const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, 'package.json');

// Читаем содержимое файла package.json
fs.readFile(packageJsonPath, 'utf8', (err, data) => {
  if (err) {
    console.error('Ошибка при чтении package.json:', err);
    return;
  }

  const packageJson = JSON.parse(data);

  // Добавляем скрипт start, если его нет
  if (!packageJson.scripts || !packageJson.scripts.start) {
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts.start = 'react-scripts start';

    // Записываем изменения обратно в файл package.json
    fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8', (err) => {
      if (err) {
        console.error('Ошибка при записи package.json:', err);
      } else {
        console.log('Скрипт start успешно добавлен в package.json');
      }
    });
  } else {
    console.log('Скрипт start уже существует в package.json');
  }
});
