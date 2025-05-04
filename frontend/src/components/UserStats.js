import { useEffect, useState } from "react";
import axios from "axios";

const UserStats = () => {
  const [totalDiplomas, setTotalDiplomas] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/diplomas/stats/total");
        setTotalDiplomas(response.data.total);
      } catch (err) {
        console.error("Ошибка при загрузке статистики", err);
        setError("Не удалось загрузить статистику.");
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="stats">
      {error && <div className="error">{error}</div>}
      <h3>Общее количество дипломов: {totalDiplomas}</h3>
    </div>
  );
};

export default UserStats;
