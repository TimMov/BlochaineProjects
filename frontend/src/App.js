import React, { useState } from 'react';
import LoginPage from './LoginPage';
import './App.css';

function App() {
  const [userRole, setUserRole] = useState(null);

  const handleLogin = (role) => {
    setUserRole(role);
  };

  const handleLogout = () => {
    setUserRole(null);
  };

  return (
    <div className="app">
      {userRole ? (
        <div>
          <header>
            <h1>Дипломы ({userRole})</h1>
            <button onClick={handleLogout}>Выйти</button>
          </header>
          {/* Здесь будет основной контент */}
        </div>
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;