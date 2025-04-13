import React, { useState } from "react";
import LoginPage from "./LoginPage";
import DiplomApp from "./AddDiplomPage"; // для администратора
import DiplomViewer from "./VieDiplomPage"; // для обычного пользователя

function App() {
  const [role, setRole] = useState(null);

  const handleLoginSuccess = (userRole) => {
    setRole(userRole);
  };

  return (
    <div>
      {!role && <LoginPage onLogin={handleLoginSuccess} />}
      {role === "admin" && <DiplomApp />}
      {role === "user" && <DiplomViewer />}
    </div>
  );
}

export default App;
