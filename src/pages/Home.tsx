import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Home() {
  const {user, isLoading} = useAuth(); 

  if (user && !isLoading) {
    return <Navigate to="/profile" replace />
  }

  return (
    <div>
      <p>Home</p>
    </div>
  );
}

export default Home;
