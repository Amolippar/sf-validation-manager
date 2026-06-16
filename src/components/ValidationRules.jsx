import { useState } from "react";
import { getValidationRules, toggleValidationRule } from "../services/salesforce";

export default function ValidationRules() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = sessionStorage.getItem("sf_access_token");
  const instanceUrl = sessionStorage.getItem("sf_instance_url");

  const fetchRules = async () => {
    setLoading(true);
    const data = await getValidationRules(instanceUrl, token);
    setRules(data);
    setLoading(false);
  };

  const handleToggle = async (rule) => {
    await toggleValidationRule(instanceUrl, token, rule.Id, rule.Active);
    fetchRules(); // refresh
  };

  const handleToggleAll = async (activate) => {
    for (const rule of rules) {
      if (rule.Active !== activate) {
        await toggleValidationRule(instanceUrl, token, rule.Id, rule.Active);
      }
    }
    fetchRules();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Validation Rules — Account Object</h2>
      <button onClick={fetchRules}>🔄 Fetch Rules</button>
      <button onClick={() => handleToggleAll(true)} style={{ margin: "0 8px" }}>✅ Enable All</button>
      <button onClick={() => handleToggleAll(false)}>❌ Disable All</button>

      {loading && <p>Loading...</p>}

      <table border="1" cellPadding="8" style={{ marginTop: "20px", width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr><th>Name</th><th>Status</th><th>Action</th></tr>
        </thead>
        <tbody>
          {rules.map((rule) => (
            <tr key={rule.Id}>
              <td>{rule.ValidationName}</td>
              <td style={{ color: rule.Active ? "green" : "red" }}>
                {rule.Active ? "🟢 Active" : "🔴 Inactive"}
              </td>
              <td>
                <button onClick={() => handleToggle(rule)}>
                  {rule.Active ? "Deactivate" : "Activate"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}