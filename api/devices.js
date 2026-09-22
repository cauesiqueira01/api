import { requireAccessorKey } from "../lib/auth.js";
import { tuyaRequest } from "../lib/tuya.js";

export default async function handler(req, res) {
  if (!requireAccessorKey(req, res)) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ success: false, error: "Método não permitido." });
  }

  try {
    let devices = [];
    let lastRowKey = "";
    let hasMore = true;
    let safety = 0;

    while (hasMore && safety < 10) {
      const query = { size: 100 };
      if (lastRowKey) query.last_row_key = lastRowKey;

      const data = await tuyaRequest(
        "GET",
        "/v1.0/iot-01/associated-users/devices",
        { query }
      );

      const result = data.result || {};
      devices.push(...(result.devices || []));

      hasMore = Boolean(result.has_more);
      lastRowKey = result.last_row_key || "";
      safety += 1;

      if (hasMore && !lastRowKey) break;
    }

    const normalized = devices.map((device) => ({
      id: device.id,
      name: device.name,
      category: device.category,
      productName: device.product_name,
      model: device.model,
      online: device.online,
      uid: device.uid,
      status: device.status || []
    }));

    return res.status(200).json({
      success: true,
      total: normalized.length,
      devices: normalized
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      stage: "tuya",
      error: error.message,
      devices: []
    });
  }
}
