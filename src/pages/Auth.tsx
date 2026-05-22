import { AuthView } from "@neondatabase/auth/react";
import { useParams } from "react-router-dom";

function Auth() {
  const { pathname } = useParams<{ pathname?: string }>();
  
  return (
    <div>
      <AuthView pathname={pathname} />
    </div>
  );
}
export default Auth;
