import { AuthView } from "@neondatabase/auth/react";
import { useParams } from "react-router-dom";

function Auth() {
  const { pathname } = useParams<{ pathname?: string }>();
  
  return (
    <div className="min-h-screen pt-24 pb-12 px-6 flex items-center justify-center">
      <div className="max-w-md w-full">
        <AuthView pathname={pathname} />
      </div>
    </div>
  );
}
export default Auth;
