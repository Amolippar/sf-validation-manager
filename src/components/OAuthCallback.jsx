import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { exchangeCodeForToken } from "../services/salesforce";

export default function OAuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) {
      exchangeCodeForToken(code).then((data) => {
        sessionStorage.setItem("sf_access_token", data.access_token);
        sessionStorage.setItem("sf_instance_url", data.instance_url);
        navigate("/dashboard");
      });
    }
  }, [navigate]);

  return <p>Logging in to Salesforce...</p>;
}