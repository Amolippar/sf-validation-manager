import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import ValidationRules from "./components/ValidationRules";
import OAuthCallback from "./components/OAuthCallback";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/dashboard" element={<ValidationRules />} />
      </Routes>
    </BrowserRouter>
  );
}