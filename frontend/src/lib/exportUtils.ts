/** Download helpers for export buttons across admin/client pages. */

export function downloadTextFile(filename: string, content: string, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadJsonFile(filename: string, data: unknown) {
  downloadTextFile(filename, JSON.stringify(data, null, 2), 'application/json;charset=utf-8');
}

export function downloadCsvFile(filename: string, headers: string[], rows: Array<Array<string | number>>) {
  const escape = (value: string | number) => {
    const text = String(value ?? '');
    if (text.includes(',') || text.includes('"') || text.includes('\n')) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const lines = [headers.map(escape).join(','), ...rows.map((row) => row.map(escape).join(','))];
  downloadTextFile(filename, lines.join('\n'), 'text/csv;charset=utf-8');
}

export function buildReceiptText(payment: {
  paymentNumber: string;
  policyNumber: string;
  amount: number;
  status: string;
  paidDate?: string;
  paymentMethod: string;
}) {
  return [
    'AssureMe Payment Receipt',
    '========================',
    `Payment #: ${payment.paymentNumber}`,
    `Policy: ${payment.policyNumber}`,
    `Amount: $${payment.amount.toFixed(2)}`,
    `Status: ${payment.status}`,
    `Method: ${payment.paymentMethod}`,
    `Date: ${payment.paidDate ? new Date(payment.paidDate).toLocaleString() : new Date().toLocaleString()}`,
  ].join('\n');
}
