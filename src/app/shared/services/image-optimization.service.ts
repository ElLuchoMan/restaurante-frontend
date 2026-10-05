import { Injectable } from '@angular/core';
import imageCompression from 'browser-image-compression';

/**
 * Resultado de la optimización
 */
export interface OptimizationResult {
  file: File;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  format: string;
  dimensions: { width: number; height: number };
}

/**
 * Callback para reportar progreso
 */
export type ProgressCallback = (progress: number) => void;

/**
 * Servicio para optimizar imágenes antes de enviarlas al backend
 * Convierte imágenes a formato WebP, redimensiona a 800x800px y
 * optimiza el tamaño de archivo a 100-150KB
 */
@Injectable({
  providedIn: 'root',
})
export class ImageOptimizationService {
  // Configuración de optimización (inspirada en el script sharp)
  private readonly TARGET_SIZE_IDEAL = 100 * 1024; // 100 KB ideal
  private readonly TARGET_SIZE_MAX = 150 * 1024; // 150 KB máximo
  private readonly IMAGE_SIZE = 800; // 800x800px
  private readonly MAX_ITERATIONS = 5; // Iteraciones máximas para ajuste de calidad

  /**
   * Optimiza una imagen convirtiéndola a WebP, redimensionándola a 800x800px
   * y ajustando su calidad para lograr un tamaño entre 100-150KB
   *
   * @param file Archivo de imagen original
   * @param onProgress Callback opcional para reportar progreso (0-100)
   * @returns Promesa con el resultado de la optimización
   */
  async optimizeImage(file: File, onProgress?: ProgressCallback): Promise<OptimizationResult> {
    const originalSize = file.size;

    // Reportar inicio
    onProgress?.(0);

    try {
      // 1. Primera pasada: comprimir a tamaño objetivo con calidad inicial
      onProgress?.(20);
      let optimizedFile = await this.compressWithQuality(file, 0.8);

      // 2. Ajuste fino: búsqueda de calidad óptima
      onProgress?.(50);
      optimizedFile = await this.findOptimalQuality(file, optimizedFile);

      // 3. Verificar dimensiones finales
      onProgress?.(90);
      const dimensions = await this.getImageDimensions(optimizedFile);

      onProgress?.(100);

      return {
        file: optimizedFile,
        originalSize,
        optimizedSize: optimizedFile.size,
        compressionRatio: (1 - optimizedFile.size / originalSize) * 100,
        format: 'webp',
        dimensions,
      };
    } catch (error) {
      console.error('Error en optimización de imagen:', error);
      throw new Error('No se pudo optimizar la imagen. Por favor, intenta con otra imagen.');
    }
  }

  /**
   * Comprime una imagen con una calidad específica
   */
  private async compressWithQuality(file: File, quality: number): Promise<File> {
    const options = {
      maxSizeMB: this.TARGET_SIZE_MAX / (1024 * 1024), // Convertir a MB
      maxWidthOrHeight: this.IMAGE_SIZE,
      useWebWorker: true,
      fileType: 'image/webp',
      initialQuality: quality,
      alwaysKeepResolution: false,
    };

    return await imageCompression(file, options);
  }

  /**
   * Busca la calidad óptima mediante iteraciones
   * Similar a la búsqueda binaria del script original
   */
  private async findOptimalQuality(originalFile: File, currentFile: File): Promise<File> {
    // Si ya estamos en el rango objetivo, retornar
    if (currentFile.size >= this.TARGET_SIZE_IDEAL && currentFile.size <= this.TARGET_SIZE_MAX) {
      return currentFile;
    }

    let bestFile = currentFile;
    let qualityLow = 0.4; // 40% calidad mínima
    let qualityHigh = 0.9; // 90% calidad máxima

    // Si el archivo es muy grande, empezar con calidad más baja
    if (currentFile.size > this.TARGET_SIZE_MAX) {
      qualityHigh = 0.7;
    }

    // Realizar iteraciones de ajuste
    for (let i = 0; i < this.MAX_ITERATIONS; i++) {
      const qualityMid = (qualityLow + qualityHigh) / 2;
      const testFile = await this.compressWithQuality(originalFile, qualityMid);

      if (testFile.size <= this.TARGET_SIZE_MAX) {
        bestFile = testFile;

        // Si estamos en el rango ideal, terminar
        if (testFile.size >= this.TARGET_SIZE_IDEAL) {
          break;
        }

        // Subir calidad para intentar acercarnos al ideal
        qualityLow = qualityMid;
      } else {
        // Bajar calidad
        qualityHigh = qualityMid;
      }

      // Si el rango es muy pequeño, terminar
      if (qualityHigh - qualityLow < 0.05) {
        break;
      }
    }

    return bestFile;
  }

  /**
   * Obtiene las dimensiones de una imagen
   */
  private getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('No se pudieron obtener las dimensiones de la imagen'));
      };

      img.src = url;
    });
  }

  /**
   * Convierte un File a base64
   * @param file Archivo a convertir
   * @returns Promesa con el string base64 (sin el prefijo data:image/...)
   */
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result as string;
        // Remover el prefijo "data:image/webp;base64,"
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
      };

      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * Valida si un archivo es una imagen válida
   */
  isValidImageFile(file: File): boolean {
    const validTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/avif',
      'image/heic',
      'image/heif',
    ];
    return validTypes.includes(file.type.toLowerCase());
  }

  /**
   * Formatea un tamaño de archivo en bytes a formato legible
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
