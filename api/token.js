const axios = require("axios");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = new URLSearchParams(req.body);

    body.set("client_id", process.env.REACT_APP_SF_CLIENT_ID);
    body.set("client_secret", process.env.REACT_APP_SF_CLIENT_SECRET);

    const response = await axios.post(
      "https://login.salesforce.com/services/oauth2/token",
      body,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (err) {
    return res.status(500).json({
      error: err.response?.data || err.message,
    });
  }
};