import { TestBed } from '@angular/core/testing';
import imageCompression from 'browser-image-compression';

import {
  createFileReaderConstructorMock,
  createFileReaderMockError,
  createFileReaderMockSuccess,
  createImageCompressionMock,
  createImageMockError,
  createImageMockSuccess,
  createURLCreateObjectURLMock,
  createURLRevokeObjectURLMock,
} from '../mocks/test-doubles';
import { ImageOptimizationService } from './image-optimization.service';

// Mock de browser-image-compression
jest.mock('browser-image-compression');

describe('ImageOptimizationService', () => {
  let service: ImageOptimizationService;
  let mockImageCompression: jest.MockedFunction<typeof imageCompression>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ImageOptimizationService],
    });
    service = TestBed.inject(ImageOptimizationService);
    mockImageCompression = imageCompression as jest.MockedFunction<typeof imageCompression>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  describe('optimizeImage', () => {
    it('debe optimizar una imagen correctamente', async () => {
      // Arrange
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(mockFile, 'size', { value: 500 * 1024 }); // 500KB

      const mockOptimizedFile = new File(['optimized'], 'test.webp', {
        type: 'image/webp',
      });
      Object.defineProperty(mockOptimizedFile, 'size', { value: 120 * 1024 }); // 120KB

      mockImageCompression.mockResolvedValue(mockOptimizedFile);

      // Mock para URL
      global.URL.createObjectURL = createURLCreateObjectURLMock();
      global.URL.revokeObjectURL = createURLRevokeObjectURLMock();

      // Mock para Image
      global.Image = createImageMockSuccess();

      const mockProgress = createImageCompressionMock();

      // Act
      const result = await service.optimizeImage(mockFile, mockProgress);

      // Assert
      expect(result).toBeDefined();
      expect(result.file).toBe(mockOptimizedFile);
      expect(result.originalSize).toBe(500 * 1024);
      expect(result.optimizedSize).toBe(120 * 1024);
      expect(result.format).toBe('webp');
      expect(result.dimensions).toEqual({ width: 800, height: 800 });
      expect(mockProgress).toHaveBeenCalledWith(0);
      expect(mockProgress).toHaveBeenCalledWith(100);
      expect(mockImageCompression).toHaveBeenCalled();
    });

    it('debe reportar progreso correctamente', async () => {
      // Arrange
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(mockFile, 'size', { value: 200 * 1024 });

      const mockOptimizedFile = new File(['optimized'], 'test.webp', {
        type: 'image/webp',
      });
      Object.defineProperty(mockOptimizedFile, 'size', { value: 100 * 1024 });

      mockImageCompression.mockResolvedValue(mockOptimizedFile);

      global.URL.createObjectURL = createURLCreateObjectURLMock();
      global.URL.revokeObjectURL = createURLRevokeObjectURLMock();
      global.Image = createImageMockSuccess();

      const mockProgress = createImageCompressionMock();

      // Act
      await service.optimizeImage(mockFile, mockProgress);

      // Assert
      expect(mockProgress).toHaveBeenCalledWith(0);
      expect(mockProgress).toHaveBeenCalledWith(20);
      expect(mockProgress).toHaveBeenCalledWith(50);
      expect(mockProgress).toHaveBeenCalledWith(90);
      expect(mockProgress).toHaveBeenCalledWith(100);
    });

    it('debe manejar errores de compresión', async () => {
      // Arrange
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      mockImageCompression.mockRejectedValue(new Error('Compression failed'));

      // Act & Assert
      await expect(service.optimizeImage(mockFile)).rejects.toThrow(
        'No se pudo optimizar la imagen. Por favor, intenta con otra imagen.',
      );
    });

    it('debe ajustar la calidad cuando el archivo es muy grande', async () => {
      // Arrange
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(mockFile, 'size', { value: 5 * 1024 * 1024 }); // 5MB

      const mockLargeFile = new File(['large'], 'test.webp', { type: 'image/webp' });
      Object.defineProperty(mockLargeFile, 'size', { value: 200 * 1024 }); // 200KB (muy grande)

      const mockOptimizedFile = new File(['optimized'], 'test.webp', {
        type: 'image/webp',
      });
      Object.defineProperty(mockOptimizedFile, 'size', { value: 100 * 1024 }); // 100KB

      // Primera llamada retorna archivo grande, segundas llamadas retornan optimizado
      mockImageCompression
        .mockResolvedValueOnce(mockLargeFile)
        .mockResolvedValue(mockOptimizedFile);

      global.URL.createObjectURL = createURLCreateObjectURLMock();
      global.URL.revokeObjectURL = createURLRevokeObjectURLMock();
      global.Image = createImageMockSuccess();

      // Act
      const result = await service.optimizeImage(mockFile);

      // Assert
      expect(mockImageCompression).toHaveBeenCalledTimes(2); // Primera pasada + ajuste
      expect(result.optimizedSize).toBe(100 * 1024);
    });

    describe('búsqueda de calidad óptima', () => {
      const KB = 1024;
      const fileOfSize = (kb: number): File => {
        const f = new File(['x'], 'test.webp', { type: 'image/webp' });
        Object.defineProperty(f, 'size', { value: kb * KB });
        return f;
      };
      const qualities = (): number[] =>
        mockImageCompression.mock.calls.map(([, options]) => options!.initialQuality as number);

      beforeEach(() => {
        global.URL.createObjectURL = createURLCreateObjectURLMock();
        global.URL.revokeObjectURL = createURLRevokeObjectURLMock();
        global.Image = createImageMockSuccess();
      });

      const original = (): File => {
        const f = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
        Object.defineProperty(f, 'size', { value: 2000 * KB });
        return f;
      };

      it('sube la calidad mientras el resultado sea menor al ideal y termina cuando el rango es muy pequeño', async () => {
        mockImageCompression
          .mockResolvedValueOnce(fileOfSize(50)) // pasada inicial (<100KB)
          .mockResolvedValueOnce(fileOfSize(60))
          .mockResolvedValueOnce(fileOfSize(70))
          .mockResolvedValueOnce(fileOfSize(80))
          .mockResolvedValueOnce(fileOfSize(90))
          .mockResolvedValue(fileOfSize(999)); // no debería usarse

        const result = await service.optimizeImage(original());

        expect(mockImageCompression).toHaveBeenCalledTimes(5);
        const q = qualities();
        expect(q[0]).toBe(0.8);
        expect(q[1]).toBeCloseTo(0.65, 5);
        expect(q[2]).toBeCloseTo(0.775, 5);
        expect(q[3]).toBeCloseTo(0.8375, 5);
        expect(q[4]).toBeCloseTo(0.86875, 5);
        expect(result.optimizedSize).toBe(90 * KB);
      });

      it('baja la calidad cuando el resultado excede el máximo y se detiene al entrar en el rango ideal', async () => {
        mockImageCompression
          .mockResolvedValueOnce(fileOfSize(300)) // inicial > 150KB => qualityHigh = 0.7
          .mockResolvedValueOnce(fileOfSize(200)) // > máximo => baja calidad
          .mockResolvedValueOnce(fileOfSize(120)) // rango ideal => termina
          .mockResolvedValue(fileOfSize(999));

        const result = await service.optimizeImage(original());

        expect(mockImageCompression).toHaveBeenCalledTimes(3);
        const q = qualities();
        expect(q[1]).toBeCloseTo(0.55, 5);
        expect(q[2]).toBeCloseTo(0.475, 5);
        expect(result.optimizedSize).toBe(120 * KB);
      });

      it('conserva el archivo actual si ninguna iteración logra bajar del máximo', async () => {
        const initial = fileOfSize(300);
        mockImageCompression.mockResolvedValueOnce(initial).mockResolvedValue(fileOfSize(200));

        const result = await service.optimizeImage(original());

        // 1 pasada inicial + 3 iteraciones (el rango 0.4-0.7 colapsa por debajo de 0.05)
        expect(mockImageCompression).toHaveBeenCalledTimes(4);
        expect(result.file).toBe(initial);
        expect(result.optimizedSize).toBe(300 * KB);
      });
    });

    it('debe manejar error al obtener dimensiones', async () => {
      // Arrange
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(mockFile, 'size', { value: 200 * 1024 });

      const mockOptimizedFile = new File(['optimized'], 'test.webp', {
        type: 'image/webp',
      });
      Object.defineProperty(mockOptimizedFile, 'size', { value: 100 * 1024 });

      mockImageCompression.mockResolvedValue(mockOptimizedFile);

      global.URL.createObjectURL = createURLCreateObjectURLMock();
      global.URL.revokeObjectURL = createURLRevokeObjectURLMock();
      global.Image = createImageMockError();

      // Act & Assert
      await expect(service.optimizeImage(mockFile)).rejects.toThrow(
        'No se pudo optimizar la imagen. Por favor, intenta con otra imagen.',
      );
    });
  });

  describe('fileToBase64', () => {
    it('debe convertir un archivo a base64', async () => {
      // Arrange
      const mockFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      const mockBase64 = 'data:image/jpeg;base64,dGVzdCBjb250ZW50';

      // Mock FileReader
      const mockFileReader = createFileReaderMockSuccess(mockBase64);
      global.FileReader = createFileReaderConstructorMock(mockFileReader);

      // Act
      const promise = service.fileToBase64(mockFile);

      // Simular que se completó la lectura
      setTimeout(() => {
        if (mockFileReader.onload) {
          mockFileReader.onload();
        }
      }, 0);

      const result = await promise;

      // Assert
      expect(result).toBe('dGVzdCBjb250ZW50'); // Sin el prefijo
      expect(mockFileReader.readAsDataURL).toHaveBeenCalledWith(mockFile);
    });

    it('debe manejar error al leer archivo', async () => {
      // Arrange
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      const mockFileReader = createFileReaderMockError();
      global.FileReader = createFileReaderConstructorMock(mockFileReader);

      // Act
      const promise = service.fileToBase64(mockFile);

      // Simular error
      setTimeout(() => {
        if (mockFileReader.onerror) {
          mockFileReader.onerror();
        }
      }, 0);

      // Assert
      await expect(promise).rejects.toThrow('Error al leer el archivo');
    });
  });

  describe('isValidImageFile', () => {
    it('debe validar archivos de imagen correctamente', () => {
      // Arrange & Act & Assert
      expect(service.isValidImageFile(new File([''], 'test.jpg', { type: 'image/jpeg' }))).toBe(
        true,
      );
      expect(service.isValidImageFile(new File([''], 'test.png', { type: 'image/png' }))).toBe(
        true,
      );
      expect(service.isValidImageFile(new File([''], 'test.gif', { type: 'image/gif' }))).toBe(
        true,
      );
      expect(service.isValidImageFile(new File([''], 'test.webp', { type: 'image/webp' }))).toBe(
        true,
      );
      expect(service.isValidImageFile(new File([''], 'test.avif', { type: 'image/avif' }))).toBe(
        true,
      );
      expect(service.isValidImageFile(new File([''], 'test.heic', { type: 'image/heic' }))).toBe(
        true,
      );
    });

    it('debe rechazar archivos no válidos', () => {
      // Arrange & Act & Assert
      expect(
        service.isValidImageFile(new File([''], 'test.pdf', { type: 'application/pdf' })),
      ).toBe(false);
      expect(service.isValidImageFile(new File([''], 'test.txt', { type: 'text/plain' }))).toBe(
        false,
      );
      expect(service.isValidImageFile(new File([''], 'test.mp4', { type: 'video/mp4' }))).toBe(
        false,
      );
    });

    it('debe manejar tipos de archivo en mayúsculas', () => {
      // Arrange & Act & Assert
      expect(service.isValidImageFile(new File([''], 'test.JPG', { type: 'IMAGE/JPEG' }))).toBe(
        true,
      );
      expect(service.isValidImageFile(new File([''], 'test.PNG', { type: 'IMAGE/PNG' }))).toBe(
        true,
      );
    });
  });

  describe('formatFileSize', () => {
    it('debe formatear bytes correctamente', () => {
      expect(service.formatFileSize(0)).toBe('0 Bytes');
      expect(service.formatFileSize(500)).toBe('500 Bytes');
      expect(service.formatFileSize(1024)).toBe('1 KB');
      expect(service.formatFileSize(1536)).toBe('1.5 KB');
      expect(service.formatFileSize(1048576)).toBe('1 MB');
      expect(service.formatFileSize(1572864)).toBe('1.5 MB');
      expect(service.formatFileSize(1073741824)).toBe('1 GB');
    });

    it('debe redondear a 2 decimales', () => {
      expect(service.formatFileSize(1234)).toBe('1.21 KB');
      expect(service.formatFileSize(123456)).toBe('120.56 KB');
    });
  });
});
