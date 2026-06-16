const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config({ path: "../.env" });

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Exchange auth code for access token
app.post("/api/token", async (req, res) => {
  try {
    const body = new URLSearchParams({ ...req.body });
    body.set("client_id", process.env.REACT_APP_SF_CLIENT_ID);
    body.set("client_secret", process.env.REACT_APP_SF_CLIENT_SECRET);

    const response = await axios.post(
      "https://login.salesforce.com/services/oauth2/token",
      body,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// Proxy Salesforce API calls
app.use("/sfapi", async (req, res) => {
  const { instance_url, access_token } = req.headers;
  try {
    const sfRes = await axios({
      method: req.method,
      url: `${instance_url}${req.path}`,
      headers: { Authorization: `Bearer ${access_token}` },
      data: req.body,
      params: req.query,
    });
    res.json(sfRes.data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

app.listen(5000, () => console.log("Proxy running on port 5000"));