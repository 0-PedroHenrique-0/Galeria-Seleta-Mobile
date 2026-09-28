# Evidências técnicas — Sprint 1

Este diretório reúne as evidências técnicas do item 1.5 da Sprint 1 do PI IV.

## Banco de dados mobile local

O aplicativo utiliza `expo-sqlite` e inicializa o banco `galeria-seleta.db` no início da aplicação. As tabelas criadas são:

- `users`
- `services`
- `appointments`
- `products`

A tabela `products` é alimentada inicialmente pelos produtos mock já existentes no projeto.

## CRUD de produtos

A tela **Gerenciar produtos**, acessível pelo Perfil, permite:

- inserir produto;
- consultar/listar produtos;
- alterar produto;
- excluir produto.

Isso mantém o cadastro solicitado no projeto integrado ao banco local.

## API Node

O diretório `/backend` contém a configuração inicial da API Node/Express e endpoints REST para o CRUD de produtos. Nesta Sprint, a API fica configurada e pronta para evolução e integração com o aplicativo.

## Script SQL e DER

- `database/schema.sql`: criação das tabelas principais.
- `docs/Sprint-1/DER.md`: Diagrama Entidade-Relacionamento e descrição dos relacionamentos.
