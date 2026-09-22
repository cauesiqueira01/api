export function requireAccessorKey(req, res) {
  const configured = process.env.ACCESSOR_API_KEY || "";
  const customHeader = String(req.headers["x-accessor-key"] || "");
  const authorization = String(req.headers["authorization"] || "");
  const bearerHeader = authorization.toLowerCase().startsWith("bearer ") ? authorization.slice(7) : "";
  const received = customHeader || bearerHeader;

  if (!configured) {
    res.status(500).json({ success: false, error: "ACCESSOR_API_KEY não configurada no servidor." });
    return false;
  }

  if (!received || received !== configured) {
    res.status(401).json({ success: false, error: "Chave do Acessor inválida ou ausente." });
    return false;
  }

  return true;
}
