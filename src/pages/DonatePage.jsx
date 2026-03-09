import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const DonatePage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirige silencieusement et immédiatement vers l'accueil
    navigate("/", { replace: true });
  }, [navigate]);

  return null; // N'affiche rien du tout
};

export default DonatePage;