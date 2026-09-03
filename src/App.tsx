import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import Profile from "./pages/Profile";
import Navbar from "./components/layout/Navbar";
import AuthProvider from "./context/AuthProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";

function App() {
  return (
    <>
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/auth/:pathname" element={<Auth />} />
                <Route path="/account/:pathname" element={<Account />} />
              </Routes>
            </ErrorBoundary>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
    </>
  );
}

export default App;
