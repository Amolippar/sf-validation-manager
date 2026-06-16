import { loginWithSalesforce } from "../services/salesforce";

export default function Login() {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Salesforce Validation Rule Manager</h1>
      <button onClick={loginWithSalesforce}
        style={{ padding: "12px 24px", fontSize: "16px", background: "#0070d2", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}>
        🔐 Login with Salesforce
      </button>
    </div>
  );
}