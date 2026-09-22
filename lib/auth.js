export function requireAccessorKey(req, res) {
  const configured = process.env.ACCESSOR_API_KEY;
  const received = req.headers["x-accessor-key"];

  if (!configured) {
    res.status(500).json({
      success: false,
      error: "ACCESSOR_API_KEY não configurada no servidor."
    });
    return false;
  }

  if (!received || received !== configured) {
    res.status(401).json({
      success: false,
      error: "X-Accessor-Key inválida ou ausente."
    });
    return false;
  }

  return true;
}
