import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { SalesReport } from './api';

const MIME = 'application/json';

export function reportFileName(report: SalesReport) {
  // Mesma régua do relatório da API: a data é a de Brasília (UTC-3).
  const day = new Date(new Date(report.geradoEm).getTime() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return `vendas-galeria-seleta-${day}.json`;
}

export async function exportSalesReport(report: SalesReport): Promise<string> {
  const fileName = reportFileName(report);
  const content = JSON.stringify(report, null, 2);

  if (Platform.OS === 'web') {
    const url = URL.createObjectURL(new Blob([content], { type: MIME }));
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    return fileName;
  }

  const file = new File(Paths.document, fileName);
  file.create({ overwrite: true });
  file.write(content);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType: MIME, dialogTitle: 'Exportar dados de vendas', UTI: 'public.json' });
  }
  return fileName;
}
