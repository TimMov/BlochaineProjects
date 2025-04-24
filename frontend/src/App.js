import React, { useState, useEffect } from 'react';
import LoginPage from './LoginPage';
import DiplomApp from './AddDiplomPage'; // Убедитесь в правильности имени
import DiplomViewer from './VieDiplomPage'; // Используйте текущее имя файла

function App() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedRole = localStorage.getItem('role');
    if (token && savedRole) {
      setRole(savedRole);
    }
  }, []);

  return (
    <div>
      {!role ? (
        <LoginPage onLogin={setRole} />
      ) : role === 'admin' ? (
        <DiplomApp />
      ) : (
        <DiplomViewer />
      )}
    </div>
  );
}

export default App;