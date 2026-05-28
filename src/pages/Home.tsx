import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Home() {
    const { user, isLoading, isDataLoading } = useAuth();

    if (isLoading || isDataLoading) return null;
    if (user) return <Navigate to="/profile" replace />;

    return (
        <div>
            <p>Home</p>
        </div>
    );
}

export default Home;