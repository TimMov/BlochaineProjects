import { useState, useEffect } from 'react';
import AddDiplomaForm from './components/AddDiplomaForm';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';  // Импортируем компонент регистрации
import DiplomaList from './VieDiplomPage'
import './App.css';

function App() {

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);  // Состояние для переключения между логином и регистрацией

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed?.id) setUser(parsed);
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (responseData) => {
    try {
      if (!responseData?.user) {
        throw new Error('Сервер не вернул данные пользователя');
      }

      const { id, username, role } = responseData.user;
      if (!id || !username || !role) {
        throw new Error('Неполные данные пользователя');
      }

      const userToStore = { id, username, role };
      localStorage.setItem('user', JSON.stringify(userToStore));
      setUser(userToStore);
      setError(null);
    } catch (e) {
      console.error('Login error:', e);
      setError(e.message);
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  if (isLoading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="App">
      {error && <div className="error">{error}</div>}

      {/* Условие для показа страницы регистрации или входа */}
      {isRegistering ? (
        <RegisterPage />  // Показываем страницу регистрации
      ) : !user ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <div className="app-content">
          <header>
            <span>Пользователь: {user.username}</span>
            <button onClick={handleLogout}>Выйти</button>
          </header>
          {user.role === 'admin' && <AddDiplomaForm />}
          {user.role === 'user' && <DiplomaList />}
        </div>
      )}

      {/* Кнопка для перехода на страницу регистрации */}
      {!isRegistering && !user && (
        <button onClick={() => setIsRegistering(true)}>Зарегистрироваться</button>
      )}
    </div>
  );
}

export default App;
