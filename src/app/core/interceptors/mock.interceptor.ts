import { mockRestauranteResponse } from './../../shared/mocks/restaurante.mock';
import { HttpInterceptorFn } from '@angular/common/http';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { mockDomiciliosRespone, mockDomicilioRespone } from '../../shared/mocks/domicilio.mock';
import { mockPagosResponse, mockPagoResponse } from '../../shared/mocks/pago.mock';


export const MockInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  console.log(`Interceptando petición a: ${req.url}`);

  const mockDelay = 500;
  if (req.url.includes('/logins')) {
    return of(new HttpResponse({ status: 200, body:  {}})).pipe(delay(mockDelay));
  }
  if (req.url.includes('/api/pagos')) {
    return of(new HttpResponse({ status: 200, body: mockPagosResponse })).pipe(delay(mockDelay));
  }

  if (req.url.includes('/api/pago')) {
    return of(new HttpResponse({ status: 200, body: mockPagoResponse })).pipe(delay(mockDelay));
  }

  if (req.url.includes('/domicilios')) {
    return of(new HttpResponse({ status: 200, body: mockDomiciliosRespone })).pipe(delay(mockDelay));
  }

  if (req.url.includes('/api/domicilio')) {
    return of(new HttpResponse({ status: 200, body: mockDomicilioRespone })).pipe(delay(mockDelay));
  }
  if (req.url.includes('/restaurantes/search?id=1')) {
    return of(new HttpResponse({ status: 200, body: mockRestauranteResponse })).pipe(delay(mockDelay));
  }

  if (req.url.includes('/cambios_horario/actual')) {
    return of(new HttpResponse({
      status: 404, body: { "code": 404, "message": "No hay cambios de horario para la fecha actual" }
    })).pipe(delay(mockDelay));
  }
  if (req.url.includes('/domicilios')) {
    return of(new HttpResponse({ status: 200, body: mockDomiciliosRespone })).pipe(delay(mockDelay));
  }
  return next(req);
};
