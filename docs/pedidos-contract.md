# Pedidos API Contract

## POST /pedidos
Request body:

```json
{
  "delivery": true
}
```

- `delivery` *(boolean)*: `true` when the order should be delivered to a domicile, `false` for on-site consumption.

## GET /pedidos/detalles
The response includes the `delivery` field in camelCase:

```json
{
  "data": {
    "delivery": false,
    "METODO_PAGO": "Nequi",
    "PRODUCTOS": "[]",
    ...
  }
}
```

Both frontend and backend must use the `delivery` property name exactly as shown to keep the contract consistent.
