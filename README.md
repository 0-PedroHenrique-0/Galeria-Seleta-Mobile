# Galeria Seleta — Mobile (versão final)

Aplicativo mobile em **React Native + Expo + TypeScript**, reconstruído a partir do frontend do projeto Galeria-Seleta-FullStack.

## Escopo

- **Sem backend e sem API:** catálogo, carrinho, usuário, endereços e pedidos usam dados mock/local.
- **Persistência local:** AsyncStorage.
- **Navegação:** React Navigation com stack + tabs inferiores.
- **Identidade visual:** Urban Dark, seguindo o frontend original.
- **Home:** hero/carrossel, copy original, NOVIDADES e rodapé.
- **Fluxos:** busca, catálogo, filtros/ordenação, detalhe do produto, carrinho, checkout, confirmação, pedidos, perfil, endereços, dados pessoais, alteração de senha, cadastro, login, recuperação de senha, sobre e contato.

## Identidade visual

- Fundo: `#0F0F0F`
- Superfície: `#1E1E1E`
- Superfície 2: `#3A3A3A`
- Texto: `#F2F2F0`
- Texto secundário: `#9A9895`
- Acento: `#E8441A`
- Erro: `#C0392B`
- Sucesso: `#27AE60`
- Display: Georgia/serif nativa como fallback mobile para o Cormorant Garamond do projeto web.
- Corpo: fonte sans-serif nativa como fallback para Lato.

## Como executar

```bash
npm install
npx expo start
```

Depois escolha Android, iOS ou web pelo Expo CLI.

## Estrutura

- `App.tsx` — navegação e tema global.
- `src/theme.ts` — tokens visuais.
- `src/data.ts` — produtos, categorias, hero e conteúdo local.
- `src/storage.ts` — persistência AsyncStorage.
- `src/components/` — componentes reutilizáveis.
- `src/screens/` — telas e fluxos.
- `assets/LogoNova-removebg.png` — logo original do projeto.

## Observação sobre imagens

Os produtos e imagens editoriais usam as URLs que já existiam nos mocks do frontend original. Portanto, o aplicativo não depende de backend, mas precisa de internet para carregar essas imagens remotas.
