import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* Both /login and /signup point to the AuthPage, which handles the toggle internally */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />

        {/* Placeholder for the dashboard we will build next */}
        <Route
          path="/dashboard"
          element={
            <div className="p-10 text-xl font-headline">
              The Archives Dashboard (Protected)
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
