# Dashboard de vendas (Python)

Lê o JSON de vendas do aplicativo e gera um painel com quatro gráficos
(faturamento por dia, ranking de produtos, vendas por categoria e pedidos por
status) e os números do resumo. Não acessa banco nem rede: só lê um arquivo.

## Instalar

Python 3.10 ou mais novo. Dentro da pasta `dashboard/`:

```
python -m pip install -r requirements.txt
```

## Rodar com o exemplo

```
python -I gerar_dashboard.py --entrada exemplo-vendas.json --saida saida/
```

Gera `saida/dashboard.png` e `saida/dashboard.html` (o HTML traz o PNG
embutido, então o arquivo é autossuficiente). A pasta `saida/` não vai para o git.

## Rodar com o arquivo exportado do aplicativo

1. No aplicativo, como administrador, use o botão de exportar os dados de
   vendas (rota `GET /api/reports/sales` da API) e salve o JSON.
2. Aponte o `--entrada` para esse arquivo:

```
python -I gerar_dashboard.py --entrada caminho/vendas.json --saida saida/
```

Se faltar algum campo obrigatório (`periodo`, `resumo`, `porDia`,
`porCategoria`, `porStatus` ou `produtos`), o programa para e diz qual.

## Como ler os números

- O faturamento total (`resumo`) e o faturamento por dia incluem o frete.
- O faturamento por categoria e por produto somam só o valor das peças, sem
  frete. Por isso a soma das categorias é menor que o faturamento total.

O arquivo `exemplo-vendas.json` é fictício: 24 pedidos aprovados entre
24/10/2026 e 22/11/2026, com os oito produtos do catálogo.

## Testes

```
python -I -m unittest -v
```
