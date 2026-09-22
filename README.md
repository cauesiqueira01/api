# Acessor Smart Home

Backend intermediário entre a Action do GPT e a Tuya/Smart Life.

## Variáveis no Vercel

- `TUYA_CLIENT_ID`
- `TUYA_CLIENT_SECRET`
- `TUYA_ENDPOINT=https://openapi.tuyaus.com`
- `ACCESSOR_API_KEY`

A `ACCESSOR_API_KEY` deve ser exatamente a mesma chave cadastrada na Action do GPT no cabeçalho `X-Accessor-Key`.

## Endpoints

- `GET /api/health`
- `GET /api/devices`
- `GET /api/devices/{deviceId}`
- `GET /api/devices/{deviceId}/status`
- `GET /api/devices/{deviceId}/functions`
- `POST /api/devices/{deviceId}/commands`

## Segurança

Não coloque Client Secret, API Key ou outras credenciais dentro do código ou no GitHub. Use apenas Environment Variables no Vercel.
