import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';

import { HandleErrorService } from './handle-error.service';

describe('HandleErrorService', () => {
  let service: HandleErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HandleErrorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should format and throw an error', (done) => {
    const mockError = new HttpErrorResponse({
      status: 500,
      error: {
        message: 'Internal Server Error',
        cause: 'Database connection failed',
      },
    });

    service.handleError(mockError).subscribe({
      next: () => {
        fail('Expected handleError to throw an error');
      },
      error: (formattedError) => {
        expect(formattedError).toEqual({
          code: 500,
          message: 'Internal Server Error',
          cause: 'Database connection failed',
        });
        done();
      },
    });
  });

  it('should handle an error without a specific message or cause', (done) => {
    const mockError = new HttpErrorResponse({
      status: 400,
      error: {},
    });

    service.handleError(mockError).subscribe({
      next: () => {
        fail('Expected handleError to throw an error');
      },
      error: (formattedError) => {
        expect(formattedError).toEqual({
          code: 400,
          message: 'Ocurrió un error inesperado',
          cause: 'No especificado',
        });
        done();
      },
    });
  });
});
