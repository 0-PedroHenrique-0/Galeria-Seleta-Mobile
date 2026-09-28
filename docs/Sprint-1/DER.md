# DER — Galeria Seleta

Modelo solicitado para a Sprint 1, contemplando as entidades principais **Usuários, Agendamentos, Produtos e Serviços**.

```mermaid
erDiagram
    USERS ||--o{ APPOINTMENTS : realiza
    SERVICES ||--o{ APPOINTMENTS : possui

    USERS {
        integer id PK
        varchar name
        varchar email UK
        varchar password_hash
        varchar phone
        datetime created_at
    }

    SERVICES {
        integer id PK
        varchar name
        text description
        decimal price
        boolean active
        datetime created_at
    }

    APPOINTMENTS {
        integer id PK
        integer user_id FK
        integer service_id FK
        datetime scheduled_at
        varchar status
        text notes
        datetime created_at
    }

    PRODUCTS {
        integer id PK
        integer category_id
        varchar category
        varchar name
        text description
        decimal price
        decimal discount_price
        integer stock
        text image
        datetime created_at
        datetime updated_at
    }
```

## Relacionamentos

- Um **usuário** pode possuir zero ou vários **agendamentos**.
- Um **serviço** pode estar associado a zero ou vários **agendamentos**.
- Cada **agendamento** referencia exatamente um usuário e um serviço.
- **Produtos** são mantidos como entidade independente no escopo atual do e-commerce e possuem CRUD no aplicativo.
