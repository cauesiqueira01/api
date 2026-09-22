import { requireAccessorKey } from "../../../lib/auth.js";
import { tuyaRequest } from "../../../lib/tuya.js";

export default async function handler(req, res) {
  if (!requireAccessorKey(req, res)) return;

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ success: false, error: "Método não permitido." });
  }

  try {
    const { deviceId } = req.query;
    const { commands } = req.body || {};

    if (!Array.isArray(commands) || commands.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Informe commands como uma lista não vazia."
      });
    }

    const data = await tuyaRequest(
      "POST",
      `/v1.0/iot-03/devices/${encodeURIComponent(deviceId)}/commands`,
      { body: { commands } }
    );

    return res.status(200).json({
      success: data.success === true && data.result === true,
      deviceId,
      result: data.result
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      error: error.message
    });
  }
}
