# Home Widgets API

## Endpoint

- Base: `/functions/v1/home-widgets`
- Auth: `Authorization: Bearer <token>` + `apikey`
- Resposta padrão:
  - sucesso: `{ "data": ... }`
  - erro: `{ "error": "mensagem" }`

## GET

Query:

- `pageKey` (opcional, padrão `home`)

Resposta:

```json
{
  "data": [
    {
      "id": "uuid",
      "page_key": "home",
      "widget_type": "hero",
      "variant": "default",
      "order_index": 0,
      "enabled": true,
      "settings": {},
      "data_binding": null,
      "version": 1,
      "created_at": "2026-03-09T18:00:00Z",
      "updated_at": "2026-03-09T18:00:00Z"
    }
  ]
}
```

## POST (create)

Body:

```json
{
  "pageKey": "home",
  "widgetType": "hero",
  "variant": "default",
  "orderIndex": 0,
  "enabled": true,
  "settings": {
    "title": "Título principal"
  },
  "dataBinding": null
}
```

## PUT (update)

Query:

- `id` obrigatório

Body:

```json
{
  "pageKey": "home",
  "widgetType": "hero",
  "variant": "default",
  "orderIndex": 0,
  "enabled": true,
  "settings": {
    "title": "Título atualizado"
  },
  "dataBinding": null,
  "version": 3
}
```

Quando `version` diverge, retorna `409`.

## DELETE

Query:

- `id` obrigatório

Resposta:

```json
{
  "data": true
}
```

## POST reorder

Query:

- `action=reorder`

Body:

```json
{
  "pageKey": "home",
  "ids": ["uuid-1", "uuid-2", "uuid-3"]
}
```

Resposta:

```json
{
  "data": [
    {
      "id": "uuid-1",
      "order_index": 0
    }
  ]
}
```

## DTO de frontend

- `HomeWidgetDto`:
  - `id`
  - `pageKey`
  - `widgetType`
  - `variant`
  - `orderIndex`
  - `enabled`
  - `settings`
  - `dataBinding`
  - `version`
  - `createdAt`
  - `updatedAt`
