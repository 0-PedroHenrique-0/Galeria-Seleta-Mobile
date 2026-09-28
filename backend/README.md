# Galeria Seleta API — Sprint 1

Configuração inicial da API Backend em **Node.js + Express** para atender ao item 1.5 do roteiro.

## Executar

```bash
cd backend
npm install
npm run dev
```

A API inicia, por padrão, em `http://localhost:3333`.

## Endpoints

- `GET /health`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

Nesta Sprint, a API está configurada com armazenamento em memória para demonstrar a estrutura Node e o CRUD REST. O banco mobile local utilizado pelo aplicativo é o SQLite (`expo-sqlite`), conforme exigido pelo roteiro. A persistência da API pode ser evoluída na Sprint seguinte sem alterar o contrato dos endpoints.
