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
    const data = await tuyaRequest(
      "GET",
      `/v1.0/iot-03/devices/${encodeURIComponent(deviceId)}/functions`
    );

    return res.status(200).json({
      success: true,
      deviceId,
      category: data.result?.category,
      functions: data.result?.functions || []
    });
  } catch (error) {
    return res.status(502).json({
      success: false,
      error: error.message
    });
  }
}
