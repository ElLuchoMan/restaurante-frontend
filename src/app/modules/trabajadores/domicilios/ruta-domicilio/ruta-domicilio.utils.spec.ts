import {
    buildNombreCliente,
    computeTotal,
    normalizeProductos,
    obtenerMetodoPagoDefaultUtil,
    parseMetodoYObservacionesUtil,
    shouldGenerateMapsUtil,
} from './ruta-domicilio.utils';

describe('ruta-domicilio.utils', () => {
  describe('buildNombreCliente', () => {
    it('concatena nombre y apellido, evitando null/undefined', () => {
      expect(buildNombreCliente({ nombre: 'N', apellido: 'A' })).toBe('N A');
      expect(buildNombreCliente({ nombre: 'N', apellido: null })).toBe('N');
      expect(buildNombreCliente(undefined)).toBe('');
    });
  });

  describe('parseMetodoYObservacionesUtil', () => {
    it('extrae método y observaciones con acentos y variantes', () => {
      const r1 = parseMetodoYObservacionesUtil('Método pago: Daviplata - Observaciones: Test');
      expect(r1).toEqual({ metodo: 'Daviplata', observaciones: 'Test' });
      const r2 = parseMetodoYObservacionesUtil('Observaciones: Solo timbrar');
      expect(r2).toEqual({ metodo: '', observaciones: 'Solo timbrar' });
      const r3 = parseMetodoYObservacionesUtil('texto libre');
      expect(r3).toEqual({ metodo: '', observaciones: 'texto libre' });
    });

    it('retorna vacío con string vacío y soporta método sin observaciones', () => {
      expect(parseMetodoYObservacionesUtil('')).toEqual({ metodo: '', observaciones: '' });
      const r = parseMetodoYObservacionesUtil('Metodo pago: NEQUI');
      expect(r).toEqual({ metodo: 'NEQUI', observaciones: '' });
    });

    it('si regex matchea pero sin valores, devuelve toda la cadena como observaciones', () => {
      const r = parseMetodoYObservacionesUtil('Método pago:');
      expect(r).toEqual({ metodo: '', observaciones: 'Método pago:' });
    });

    it('trimea valores y acepta observaciones vacías tras guion', () => {
      const r = parseMetodoYObservacionesUtil('Metodo pago: Daviplata - Observaciones:   ');
      expect(r).toEqual({ metodo: 'Daviplata', observaciones: '' });
    });

    it('ramas del plan B: captura metodo por clave y sin observaciones', () => {
      const r = parseMetodoYObservacionesUtil('Metodo: NEQUI - Nota: Hola');
      expect(r).toEqual({ metodo: 'NEQUI', observaciones: '' });
    });

    it('plan B captura metodo y observaciones cuando ambas claves están presentes', () => {
      const r = parseMetodoYObservacionesUtil('Metodo: DAVIPLATA - Observaciones: Traer cambio');
      expect(r).toEqual({ metodo: 'DAVIPLATA', observaciones: 'Traer cambio' });
    });

    it('plan B sin guion: captura solo metodo', () => {
      const r = parseMetodoYObservacionesUtil('Metodo: NEQUI');
      expect(r).toEqual({ metodo: 'NEQUI', observaciones: '' });
    });

    it('plan B con claves desconocidas devuelve observaciones originales', () => {
      const s = 'Otra: cosa';
      const r = parseMetodoYObservacionesUtil(s);
      expect(r).toEqual({ metodo: '', observaciones: s });
    });

    it('plan B activado solo por guion (sin dos puntos) devuelve original', () => {
      const s = 'metodo - observaciones';
      const r = parseMetodoYObservacionesUtil(s);
      expect(r).toEqual({ metodo: '', observaciones: s });
    });

    it('regex: método vacío y observaciones presentes', () => {
      const r = parseMetodoYObservacionesUtil('Método pago:  - Observaciones: Hola');
      expect(r).toEqual({ metodo: '', observaciones: 'Hola' });
    });

    it('plan B con clave vacía devuelve original', () => {
      const s = ': valor';
      const r = parseMetodoYObservacionesUtil(s);
      expect(r).toEqual({ metodo: '', observaciones: s });
    });
  });

  describe('normalizeProductos', () => {
    it('normaliza desde array y string JSON, mapea claves alternativas', () => {
      const arr = normalizeProductos([
        { NOMBRE: 'A', CANTIDAD: '2', PRECIO: '5', SUBTOTAL: '10', PK_ID_PRODUCTO: 1 },
      ]);
      expect(arr[0]).toEqual({ nombre: 'A', cantidad: 2, precioUnitario: 5, subtotal: 10, productoId: 1 });

      const fromStr = normalizeProductos('[{"nombre":"B","cantidad":"3","precioUnitario":"2"}]');
      expect(fromStr[0]).toEqual({ nombre: 'B', cantidad: 3, precioUnitario: 2, subtotal: 0, productoId: undefined });
    });

    it('devuelve [] para JSON inválido o no array', () => {
      expect(normalizeProductos('{invalid')).toEqual([]);
      expect(normalizeProductos('{"a":1}')).toEqual([]);
    });

    it('usa valores por defecto cuando faltan claves', () => {
      const res = normalizeProductos([{}]);
      expect(res[0]).toEqual({ nombre: '', cantidad: 0, precioUnitario: 0, subtotal: 0, productoId: undefined });
    });

    it('toma productoId alternativo incluso si es 0', () => {
      const res = normalizeProductos([{ productoId: 0 }]);
      expect(res[0].productoId).toBe(0);
    });

    it('acepta undefined como entrada y devuelve []', () => {
      expect(normalizeProductos(undefined as any)).toEqual([]);
    });

    it('usa PRECIO_UNITARIO y subtotal (segunda clave)', () => {
      const res = normalizeProductos([{ NOMBRE: 'Z', CANTIDAD: '1', PRECIO_UNITARIO: '7', subtotal: '9', PK_ID_PRODUCTO: 5 }]);
      expect(res[0]).toEqual({ nombre: 'Z', cantidad: 1, precioUnitario: 7, subtotal: 9, productoId: 5 });
    });
  });

  describe('computeTotal', () => {
    it('usa totalRaw cuando es válido, si no suma subtotales', () => {
      const prods = [
        { nombre: 'A', cantidad: 1, precioUnitario: 5, subtotal: 5 },
        { nombre: 'B', cantidad: 2, precioUnitario: 2, subtotal: 4 },
      ];
      expect(computeTotal(9, prods as any)).toBe(9);
      expect(computeTotal(undefined, prods as any)).toBe(9);
    });

    it('ignora totalRaw no numérico o null y suma subtotales; acepta 0', () => {
      const prods = [
        { nombre: 'A', cantidad: 1, precioUnitario: 5, subtotal: 5 },
        { nombre: 'B', cantidad: 2, precioUnitario: 2, subtotal: 4 },
      ];
      expect(computeTotal('abc' as any, prods as any)).toBe(9);
      expect(computeTotal(null as any, prods as any)).toBe(9);
      expect(computeTotal(0, prods as any)).toBe(0);
    });

    it('con lista vacía retorna 0 cuando no hay totalRaw', () => {
      expect(computeTotal(undefined, [] as any)).toBe(0);
    });

    it('acepta totalRaw como string numérico', () => {
      const prods = [{ nombre: 'A', cantidad: 1, precioUnitario: 5, subtotal: 5 }];
      expect(computeTotal('5' as any, prods as any)).toBe(5);
    });

    it('usa rama derecha del OR en reduce cuando subtotal es 0', () => {
      const prods = [{ nombre: 'A', cantidad: 1, precioUnitario: 0, subtotal: 0 }];
      expect(computeTotal(undefined, prods as any)).toBe(0);
    });
  });

  describe('obtenerMetodoPagoDefaultUtil', () => {
    it('mapea variantes a NEQUI/DAVIPLATA/EFECTIVO', () => {
      expect(obtenerMetodoPagoDefaultUtil('NequÍ')).toBe('NEQUI');
      expect(obtenerMetodoPagoDefaultUtil('Daví plata')).toBe('DAVIPLATA');
      expect(obtenerMetodoPagoDefaultUtil('CASH')).toBe('EFECTIVO');
      expect(obtenerMetodoPagoDefaultUtil('???')).toBeNull();
    });

    it('retorna null con input vacío', () => {
      expect(obtenerMetodoPagoDefaultUtil('')).toBeNull();
    });

    it('mapea explícitamente EFECTIVO además de CASH', () => {
      expect(obtenerMetodoPagoDefaultUtil('Efectivo')).toBe('EFECTIVO');
    });
  });

  describe('shouldGenerateMapsUtil', () => {
    it('true si no hay param; con param vacío usa default y retorna true', () => {
      expect(shouldGenerateMapsUtil(undefined, 'X')).toBe(true);
      expect(shouldGenerateMapsUtil('', 'Default')).toBe(true);
      expect(shouldGenerateMapsUtil('', '')).toBe(false);
    });

    it('con param presente y direccionFinal vacía retorna false', () => {
      expect(shouldGenerateMapsUtil('abc', '')).toBe(false);
    });

    it('con param presente y direccionFinal truthy retorna true', () => {
      expect(shouldGenerateMapsUtil('abc', 'Alguna calle')).toBe(true);
    });

    it('cuando direccionParam es undefined retorna true aun con direccionFinal vacía', () => {
      expect(shouldGenerateMapsUtil(undefined, '')).toBe(true);
    });
  });
});


