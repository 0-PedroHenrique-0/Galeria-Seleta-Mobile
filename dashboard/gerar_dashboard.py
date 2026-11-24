"""Dashboard de vendas da Galeria Seleta.

Lê o JSON exportado pelo aplicativo (rota GET /api/reports/sales) e gera
dois arquivos: dashboard.png (os quatro gráficos) e dashboard.html (o mesmo
painel com os números do resumo em texto). Não acessa banco nem rede.

Uso:
    python -I gerar_dashboard.py --entrada exemplo-vendas.json --saida saida/
"""
import argparse
import base64
import html
import json
import textwrap
from pathlib import Path

import matplotlib

matplotlib.use("Agg")  # sem janela: funciona em CI e em servidor
import matplotlib.dates as mdates
import matplotlib.pyplot as plt
import pandas as pd

# Identidade visual do aplicativo.
FUNDO = "#0F0F0F"
SUPERFICIE = "#1E1E1E"
TEXTO = "#F2F2F0"
TEXTO_SECUNDARIO = "#9A9895"
ACENTO = "#E8441A"

CAMPOS_OBRIGATORIOS = ("periodo", "resumo", "porDia", "porCategoria", "porStatus", "produtos")

NOMES_DE_STATUS = {
    "APROVADO": "Aprovado",
    "AGUARDANDO_PAGAMENTO": "Aguardando pagamento",
    "EM_ANALISE": "Em análise",
    "RECUSADO": "Recusado",
}

AVISO_FRETE = (
    "O faturamento total e o faturamento por dia incluem o frete. "
    "Os valores por categoria e por produto somam só as peças, sem frete; "
    "por isso a soma deles é menor que o total."
)


def carregar(caminho):
    """Lê o JSON do relatório e confere se os campos obrigatórios existem."""
    with open(caminho, encoding="utf-8") as arquivo:
        relatorio = json.load(arquivo)
    if not isinstance(relatorio, dict):
        raise ValueError("O arquivo não tem o formato do relatório de vendas.")
    for campo in CAMPOS_OBRIGATORIOS:
        if campo not in relatorio:
            raise ValueError(f"Campo obrigatório ausente no JSON: '{campo}'.")
    return relatorio


def moeda(valor):
    """Formata em reais, no padrão brasileiro: R$ 1.234,50."""
    texto = f"{valor:,.2f}"
    texto = texto.replace(",", "_").replace(".", ",").replace("_", ".")
    return f"R$ {texto}"


def nome_do_status(status):
    return NOMES_DE_STATUS.get(status, status.replace("_", " ").capitalize())


def texto_do_periodo(periodo):
    if periodo.get("de") and periodo.get("ate"):
        return f"Período: {periodo['de']} a {periodo['ate']}"
    return "Período: todos os pedidos"


def estilizar_eixo(eixo, titulo):
    eixo.set_facecolor(SUPERFICIE)
    eixo.set_title(titulo, color=TEXTO, fontsize=12, loc="left", pad=10)
    eixo.tick_params(colors=TEXTO_SECUNDARIO, labelsize=10)
    for lado in ("top", "right"):
        eixo.spines[lado].set_visible(False)
    for lado in ("left", "bottom"):
        eixo.spines[lado].set_color(TEXTO_SECUNDARIO)


def avisar_sem_dados(eixo):
    eixo.text(0.5, 0.5, "Sem vendas no período", color=TEXTO_SECUNDARIO,
              ha="center", va="center", transform=eixo.transAxes, fontsize=12)
    eixo.set_xticks([])
    eixo.set_yticks([])


def grafico_faturamento_por_dia(eixo, por_dia):
    estilizar_eixo(eixo, "Faturamento por dia (inclui frete)")
    if not por_dia:
        avisar_sem_dados(eixo)
        return
    tabela = pd.DataFrame(por_dia)
    tabela["data"] = pd.to_datetime(tabela["data"])
    tabela = tabela.sort_values("data")
    eixo.plot(tabela["data"], tabela["faturamento"], color=ACENTO,
              marker="o", markersize=4, linewidth=2)
    eixo.fill_between(tabela["data"], tabela["faturamento"], color=ACENTO, alpha=0.15)
    # Marca só os dias que existem nos dados, no máximo seis. Deixar o matplotlib
    # escolher sozinho faz ele dividir o intervalo em horas quando há poucos dias,
    # e o rótulo "%d/%m" acaba repetindo a mesma data.
    datas = list(tabela["data"])
    passo = (len(datas) + 5) // 6
    eixo.set_xticks(datas[::passo])
    eixo.xaxis.set_major_formatter(mdates.DateFormatter("%d/%m"))
    eixo.set_ylabel("R$", color=TEXTO_SECUNDARIO)
    eixo.grid(axis="y", color=TEXTO_SECUNDARIO, alpha=0.25)


def grafico_ranking_de_produtos(eixo, produtos):
    estilizar_eixo(eixo, "Ranking de produtos (R$ sem frete)")
    if not produtos:
        avisar_sem_dados(eixo)
        return
    ordenados = sorted(produtos, key=lambda p: p["faturamento"], reverse=True)[:8]
    ordenados.reverse()  # o maior fica no topo
    nomes = [p["nome"] for p in ordenados]
    valores = [p["faturamento"] for p in ordenados]
    barras = eixo.barh(nomes, valores, color=ACENTO)
    eixo.bar_label(barras, labels=[moeda(v) for v in valores],
                   color=TEXTO, fontsize=10, padding=3)
    eixo.set_xlim(0, max(valores) * 1.35 if max(valores) > 0 else 1)


def grafico_vendas_por_categoria(eixo, categorias):
    estilizar_eixo(eixo, "Vendas por categoria (R$ sem frete)")
    if not categorias:
        avisar_sem_dados(eixo)
        return
    nomes = [c["categoria"] for c in categorias]
    valores = [c["faturamento"] for c in categorias]
    barras = eixo.bar(nomes, valores, color=ACENTO)
    eixo.bar_label(barras, labels=[moeda(v) for v in valores],
                   color=TEXTO, fontsize=10, padding=4, rotation=90)
    eixo.tick_params(axis="x", labelrotation=20)
    eixo.set_ylim(0, max(valores) * 2.0 if max(valores) > 0 else 1)  # espaço para o rótulo em pé


def grafico_pedidos_por_status(eixo, status):
    estilizar_eixo(eixo, "Pedidos por status")
    if not status:
        avisar_sem_dados(eixo)
        return
    ordenados = sorted(status, key=lambda s: s["pedidos"])  # o maior fica no topo
    nomes = [nome_do_status(s["status"]) for s in ordenados]
    valores = [s["pedidos"] for s in ordenados]
    barras = eixo.barh(nomes, valores, color=ACENTO)
    eixo.bar_label(barras, labels=[str(v) for v in valores],
                   color=TEXTO, fontsize=10, padding=3)
    eixo.set_xlim(0, max(valores) * 1.2 if max(valores) > 0 else 1)


def indicadores_do_resumo(resumo):
    """Pares (rótulo, valor) mostrados no cabeçalho do painel."""
    return [
        ("Pedidos aprovados", str(resumo["pedidos"])),
        ("Faturamento (inclui frete)", moeda(resumo["faturamento"])),
        ("Ticket médio", moeda(resumo["ticketMedio"])),
        ("Itens vendidos", str(resumo["itensVendidos"])),
        ("Clientes", str(resumo["clientes"])),
    ]


def desenhar_cabecalho(figura, relatorio):
    figura.text(0.03, 0.965, "Galeria Seleta | Painel de vendas", color=TEXTO,
                fontsize=17, fontweight="bold", va="top")
    figura.text(0.97, 0.965, texto_do_periodo(relatorio["periodo"]),
                color=TEXTO_SECUNDARIO, fontsize=10, va="top", ha="right")
    indicadores = indicadores_do_resumo(relatorio["resumo"])
    largura = 0.94 / len(indicadores)
    for posicao, (rotulo, valor) in enumerate(indicadores):
        x = 0.03 + posicao * largura
        figura.text(x, 0.905, rotulo, color=TEXTO_SECUNDARIO, fontsize=10, va="top")
        figura.text(x, 0.88, valor, color=ACENTO, fontsize=15,
                    fontweight="bold", va="top")


def montar_figura(relatorio):
    # Figura pequena de propósito: impressa no documento final, cada ponto de fonte daqui
    # vale cerca de 0,6 ponto no papel, e nenhum texto pode sair abaixo de 6 pontos.
    figura, eixos = plt.subplots(2, 2, figsize=(10, 7.2), facecolor=FUNDO)
    figura.subplots_adjust(top=0.76, bottom=0.14, left=0.13, right=0.97,
                           hspace=0.55, wspace=0.42)
    desenhar_cabecalho(figura, relatorio)
    grafico_faturamento_por_dia(eixos[0][0], relatorio["porDia"])
    grafico_ranking_de_produtos(eixos[0][1], relatorio["produtos"])
    grafico_vendas_por_categoria(eixos[1][0], relatorio["porCategoria"])
    grafico_pedidos_por_status(eixos[1][1], relatorio["porStatus"])
    figura.text(0.03, 0.015, textwrap.fill(AVISO_FRETE, 95), color=TEXTO_SECUNDARIO,
                fontsize=10, va="bottom", linespacing=1.4)
    return figura


def montar_html(relatorio, png):
    """Página única: números do resumo em texto e o PNG embutido em base64."""
    imagem = base64.b64encode(png.read_bytes()).decode("ascii")
    cartoes = "\n".join(
        f'    <div class="cartao"><span>{html.escape(rotulo)}</span>'
        f"<strong>{html.escape(valor)}</strong></div>"
        for rotulo, valor in indicadores_do_resumo(relatorio["resumo"])
    )
    aviso_vazio = ""
    if relatorio["resumo"]["pedidos"] == 0:
        aviso_vazio = '  <p class="vazio">Sem vendas no período.</p>\n'
    periodo = html.escape(texto_do_periodo(relatorio["periodo"]))
    return f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Galeria Seleta | Painel de vendas</title>
  <style>
    body {{ background: {FUNDO}; color: {TEXTO}; font-family: Arial, sans-serif;
           margin: 0; padding: 24px; }}
    h1 {{ margin: 0 0 4px; }}
    .periodo, .nota {{ color: {TEXTO_SECUNDARIO}; margin: 0 0 16px; }}
    .resumo {{ display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; }}
    .cartao {{ background: {SUPERFICIE}; border-radius: 8px; padding: 12px 16px;
              min-width: 150px; }}
    .cartao span {{ display: block; color: {TEXTO_SECUNDARIO}; font-size: 13px; }}
    .cartao strong {{ color: {ACENTO}; font-size: 22px; }}
    .vazio {{ color: {TEXTO_SECUNDARIO}; }}
    img {{ max-width: 100%; height: auto; border-radius: 8px; }}
  </style>
</head>
<body>
  <h1>Galeria Seleta | Painel de vendas</h1>
  <p class="periodo">{periodo}</p>
  <div class="resumo">
{cartoes}
  </div>
{aviso_vazio}  <p class="nota">Como ler: o faturamento total e o faturamento por dia
  incluem o frete. Os valores por categoria e por produto somam só as peças,
  sem frete.</p>
  <img src="data:image/png;base64,{imagem}"
       alt="Gráficos de vendas: faturamento por dia, ranking de produtos, vendas por categoria e pedidos por status">
</body>
</html>
"""


def gerar(relatorio, destino):
    """Cria dashboard.png e dashboard.html em `destino` e devolve os caminhos."""
    destino = Path(destino)
    destino.mkdir(parents=True, exist_ok=True)
    caminho_png = destino / "dashboard.png"
    caminho_html = destino / "dashboard.html"

    figura = montar_figura(relatorio)
    figura.savefig(caminho_png, dpi=160, facecolor=FUNDO)
    plt.close(figura)

    caminho_html.write_text(montar_html(relatorio, caminho_png), encoding="utf-8")
    return {"png": caminho_png, "html": caminho_html}


def principal():
    leitor = argparse.ArgumentParser(description="Gera o painel de vendas a partir do JSON.")
    leitor.add_argument("--entrada", required=True, help="JSON exportado pelo aplicativo")
    leitor.add_argument("--saida", default="saida", help="pasta de saída (padrão: saida)")
    argumentos = leitor.parse_args()
    try:
        relatorio = carregar(argumentos.entrada)
    except (OSError, ValueError) as erro:
        raise SystemExit(f"Erro: {erro}")
    arquivos = gerar(relatorio, Path(argumentos.saida))
    for nome, caminho in arquivos.items():
        print(f"{nome}: {caminho.resolve()}")


if __name__ == "__main__":
    principal()
