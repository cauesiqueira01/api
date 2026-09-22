import { requireAccessorKey } from "../lib/auth.js";
import { tuyaRequest } from "../lib/tuya.js";

export default async function handler(req, res) {
  if (!requireAccessorKey(req, res)) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, error: "Método não permitido." });
  }

  try {
    const data = await tuyaRequest("GET", "/v1.0/iot-01/associated-users/devices", {
      query: { size: 1 }
    });

    return res.status(200).json({
      success: true,
      stage: "tuya",
      message: "Acessor conectado à Tuya.",
      tuyaSuccess: data.success === true
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      stage: "tuya",
      error: error.message
    });
  }
}
