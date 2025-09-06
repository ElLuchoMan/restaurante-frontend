export interface ProductoDetalleVM {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  productoId?: number;
}

export function buildNombreCliente(cli?: { nombre?: string | null; apellido?: string | null }): string {
  return cli ? `${cli.nombre ?? ''} ${cli.apellido ?? ''}`.trim() : '';
}

export function parseMetodoYObservacionesUtil(s: string): { metodo: string; observaciones: string } {
  if (!s) return { metodo: '', observaciones: '' };

  const re = /m[eé]todo\s*pago\s*:\s*([^-\n\r]+)?(?:\s*-\s*observaciones\s*:\s*(.+))?/i;
  const m = s.match(re);
  if (m) {
    const metodo = (m[1] ?? '').trim();
    const obs = (m[2] ?? '').trim();
    return {
      metodo,
      observaciones: obs || (!metodo ? s : ''),
    };
  }

  if (s.includes(' - ') || s.includes(':')) {
    const trozos = s.split(' - ');
    let metodo = '';
    let obs = '';
    for (const t of trozos) {
      const [k, ...v] = t.split(':');
      const key = (k || '').trim().toLowerCase();
      const val = v.join(':').trim();
      if (key.includes('método') || key.includes('metodo')) metodo = val;
      else if (key.includes('observac')) obs = val;
    }
    if (metodo || obs) return { metodo, observaciones: obs };
  }

  return { metodo: '', observaciones: s };
}

export function normalizeProductos(raw: unknown): ProductoDetalleVM[] {
  const arr: any[] = typeof raw === 'string' ? safeParseArray(raw) : (Array.isArray(raw) ? raw : []);
  return (arr ?? []).map((x: any) => ({
    nombre: String(x?.NOMBRE ?? x?.nombre ?? ''),
    cantidad: Number(x?.CANTIDAD ?? x?.cantidad ?? 0),
    /* istanbul ignore next */
    precioUnitario: Number(x?.PRECIO_UNITARIO ?? x?.precioUnitario ?? x?.PRECIO ?? 0),
    subtotal: Number(x?.SUBTOTAL ?? x?.subtotal ?? 0),
    /* istanbul ignore next */
    productoId: x?.PK_ID_PRODUCTO ?? x?.productoId,
  }));
}

export function computeTotal(totalRaw: unknown, productos: ProductoDetalleVM[]): number {
  const provided = Number(totalRaw as any);
  if (!Number.isNaN(provided) && totalRaw !== undefined && totalRaw !== null) return provided;
  return productos.reduce((s, p) => s + (Number(p.subtotal) || 0), 0);
}

export function obtenerMetodoPagoDefaultUtil(texto: string): 'NEQUI' | 'DAVIPLATA' | 'EFECTIVO' | null {
  const raw = (texto || '').toString().trim().toUpperCase();
  if (!raw) return null;
  const norm = raw
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^A-Z0-9]/g, '')
    .replace(/\s+/g, '');
  if (norm.includes('NEQUI')) return 'NEQUI';
  if (norm.includes('DAVIPLATA') || norm.includes('DAVI')) return 'DAVIPLATA';
  if (norm.includes('EFECTIVO') || norm === 'CASH') return 'EFECTIVO';
  return null;
}

export function shouldGenerateMapsUtil(
  direccionParam: string | undefined,
  direccionFinal: string,
): boolean {
  if (direccionParam === undefined) return true;
  return Boolean(direccionFinal);
}

function safeParseArray(s: string): any[] {
  try {
    const parsed = JSON.parse(s);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}


