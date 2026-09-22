import { requireAccessorKey } from "../../../lib/auth.js";
import { tuyaRequest } from "../../../lib/tuya.js";

export default async function handler(req, res) {
  if (!requireAccessorKey(req, res)) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, error: "Método não permitido." });
  }

  try {
    const { deviceId } = req.query;
    const data = await tuyaRequest("GET", `/v1.0/devices/${encodeURIComponent(deviceId)}`);

    return res.status(200).json({
      success: true,
      device: data.result
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      error: error.message
    });
  }
}
