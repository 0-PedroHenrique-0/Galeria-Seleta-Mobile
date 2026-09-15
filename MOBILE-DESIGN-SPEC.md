# Galeria Seleta — especificação visual mobile

Esta especificação acompanha o código final para manter a implementação consistente com a identidade do frontend original.

## Tokens

| Token | Valor |
|---|---|
| Fundo | #0F0F0F |
| Superfície | #1E1E1E |
| Superfície 2 | #3A3A3A |
| Texto | #F2F2F0 |
| Texto secundário | #9A9895 |
| Acento | #E8441A |
| Erro | #C0392B |
| Sucesso | #27AE60 |

## Regras de layout

- Largura de referência mobile: 390 px.
- Margem horizontal padrão: 16–20 px.
- Cards: raio de 5–9 px.
- Imagens de produto: proporção aproximada 3:4.
- Hero: proporção 4:3.
- Títulos editoriais usam serif/itálico; textos de interface usam sans-serif.
- Ações principais usam o laranja da marca; ações secundárias usam `#3A3A3A`.
- Não usar integração de backend.
- Dados de catálogo, carrinho, pedidos, usuário e endereços são locais/mock.

## Telas

1. **Home** — header, hero com carrossel, copy “Encontre Peças únicas”, CTA “COMPRE AGORA”, faixa NOVIDADES e footer.
2. **Produtos** — controles de organizar/filtrar, chips de categorias e grid 2 colunas.
3. **Busca** — campo de busca, buscas recentes, categorias e resultados.
4. **Detalhes do produto** — imagem, categoria, preço/desconto, descrição, tamanho, quantidade e ações.
5. **Carrinho** — itens, quantidade, remoção, cupom, resumo e checkout.
6. **Checkout** — entrega, frete, pagamento e confirmação; PIX inclui QR/código demonstrativo.
7. **Sucesso** — confirmação do pedido e ações de continuidade.
8. **Login** — bloco editorial + formulário.
9. **Cadastro** — criação de conta e aceite dos termos.
10. **Recuperar senha** — e-mail → código → nova senha.
11. **Pedidos** — histórico persistido localmente.
12. **Detalhe do pedido** — status, itens, endereço e total.
13. **Perfil** — dados do usuário e atalhos.
14. **Endereços** — listar, adicionar e definir endereço padrão.
15. **Dados pessoais** — editar nome, e-mail e telefone.
16. **Alterar senha** — validação local da nova senha.
17. **Sobre nós** — conteúdo original da seção “Como funciona a Galeria Seleta”.
18. **Contato** — e-mail, telefone, endereço, horários e formas de pagamento.

## Navegação

- Tabs inferiores: Início, Produtos, Carrinho, Pedidos e Perfil.
- Menu lateral no ícone hambúrguer: acesso às principais áreas.
- Busca abre uma tela dedicada.
- Cards de produto abrem detalhes.
- Checkout cria um pedido local e limpa a sacola.
