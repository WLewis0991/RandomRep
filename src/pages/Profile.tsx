import { useAuth } from "../context/useAuth";
import { Navigate } from "react-router-dom";

function Profile() {
    const {user, isLoading} = useAuth(); 
    const plan = true;
  
    if (!user && !isLoading) {
      return <Navigate to="/auth/sign-in" replace />
    }
    if ( user && !plan){
      return <Navigate to="/onboarding" replace />
    }

  return (
    <div>
      <p>Profile</p>
    </div>
  );
}

export default Profile;
