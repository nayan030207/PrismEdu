import { NextResponse } from 'next/server';
import { ImportService } from '@/lib/services/import.service';

export async function GET() {
  const service = new ImportService();
  const buffer = service.generateSampleTemplateBuffer();

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="PRISM_User_Import_Template.xlsx"',
    },
  });
}
