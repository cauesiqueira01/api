import { tuyaRequest } from "../lib/tuya.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(200).json({ success: false, stage: "method", error: "Método não permitido." });
  }

  const configured = process.env.ACCESSOR_API_KEY || "";
  const customHeader = String(req.headers["x-accessor-key"] || "");
  const authorization = String(req.headers["authorization"] || "");
  const bearerHeader = authorization.toLowerCase().startsWith("bearer ") ? authorization.slice(7) : "";
  const received = customHeader || bearerHeader;

  const authConfigured = configured.length > 0;
  const customHeaderPresent = customHeader.length > 0;
  const bearerHeaderPresent = bearerHeader.length > 0;
  const authHeaderPresent = received.length > 0;
  const authMatch = authConfigured && authHeaderPresent && received === configured;

  if (!authMatch) {
    return res.status(200).json({
      success: false,
      stage: "accessor_auth",
      authConfigured,
      authHeaderPresent,
      customHeaderPresent,
      bearerHeaderPresent,
      authMatch
    });
  }

  try {
    const data = await tuyaRequest("GET", "/v1.0/iot-01/associated-users/devices", { query: { size: 1 } });
    return res.status(200).json({
      success: true,
      stage: "tuya",
      authConfigured,
      authHeaderPresent,
      customHeaderPresent,
      bearerHeaderPresent,
      authMatch,
      tuyaSuccess: data.success === true
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      stage: "tuya",
      authConfigured,
      authHeaderPresent,
      customHeaderPresent,
      bearerHeaderPresent,
      authMatch,
      error: error.message
    });
  }
}
