import { useState } from 'react';
import AddDiplomPage from './AddDiplomPage';
import LoginPage from './LoginPage';

function App() {
  const [user, setUser] = useState(null);

  return (
    <div className="App">
      {!user ? (
        <LoginPage onLogin={setUser} />
      ) : (
        <>
          <button onClick={() => setUser(null)}>Выйти</button>
          {user.role === 'admin' && <AddDiplomPage />}
        </>
      )}
    </div>
  );
}

export default App;