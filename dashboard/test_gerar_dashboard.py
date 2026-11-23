"""Testes do dashboard de vendas (unittest, sem dependência além do próprio painel)."""
import json
import tempfile
import unittest
from pathlib import Path

import gerar_dashboard

EXEMPLO = Path(__file__).parent / "exemplo-vendas.json"


class GerarDashboardTest(unittest.TestCase):
    def test_gera_png_e_html_a_partir_do_exemplo(self):
        relatorio = gerar_dashboard.carregar(EXEMPLO)
        with tempfile.TemporaryDirectory() as pasta:
            arquivos = gerar_dashboard.gerar(relatorio, Path(pasta) / "saida")
            self.assertTrue(arquivos["png"].exists())
            self.assertTrue(arquivos["html"].exists())
            self.assertGreater(arquivos["png"].stat().st_size, 10 * 1024)

    def test_html_traz_os_numeros_do_resumo(self):
        relatorio = gerar_dashboard.carregar(EXEMPLO)
        with tempfile.TemporaryDirectory() as pasta:
            arquivos = gerar_dashboard.gerar(relatorio, Path(pasta))
            html = arquivos["html"].read_text(encoding="utf-8")
        resumo = relatorio["resumo"]
        faturamento = gerar_dashboard.moeda(resumo["faturamento"])
        ticket = gerar_dashboard.moeda(resumo["ticketMedio"])
        self.assertIn(faturamento, html)
        self.assertIn(ticket, html)
        self.assertRegex(faturamento, r"^R\$ \d{1,3}(\.\d{3})*,\d{2}$")
        self.assertIn("incluem o frete", html)
        self.assertIn("sem frete", html)

    def test_relatorio_vazio_gera_painel_sem_erro(self):
        vazio = {
            "geradoEm": "2026-11-23T12:00:00.000Z",
            "periodo": {"de": None, "ate": None},
            "resumo": {"pedidos": 0, "faturamento": 0, "ticketMedio": 0,
                       "itensVendidos": 0, "clientes": 0},
            "porDia": [], "porCategoria": [], "porStatus": [], "produtos": [],
        }
        with tempfile.TemporaryDirectory() as pasta:
            arquivos = gerar_dashboard.gerar(vazio, Path(pasta))
            self.assertTrue(arquivos["png"].exists())
            self.assertGreater(arquivos["png"].stat().st_size, 0)
            html = arquivos["html"].read_text(encoding="utf-8")
        self.assertIn("R$ 0,00", html)
        self.assertIn("Sem vendas no período", html)

    def test_json_sem_campo_obrigatorio_da_erro_legivel(self):
        dados = json.loads(EXEMPLO.read_text(encoding="utf-8"))
        del dados["porCategoria"]
        with tempfile.TemporaryDirectory() as pasta:
            caminho = Path(pasta) / "quebrado.json"
            caminho.write_text(json.dumps(dados), encoding="utf-8")
            with self.assertRaises(ValueError) as erro:
                gerar_dashboard.carregar(caminho)
        self.assertIn("porCategoria", str(erro.exception))


if __name__ == "__main__":
    unittest.main()
