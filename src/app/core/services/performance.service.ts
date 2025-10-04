import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift

  // Other metrics
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte

  // Navigation timing
  domContentLoaded?: number;
  loadComplete?: number;

  // Custom metrics
  routeChangeTime?: number;

  // Page info
  url?: string;
  timestamp?: number;
}

@Injectable({
  providedIn: 'root',
})
export class PerformanceService {
  private metrics: PerformanceMetrics[] = [];
  private navigationStartTime = 0;

  constructor(private router: Router) {
    this.initializePerformanceObserver();
    this.trackRouteChanges();
  }

  private initializePerformanceObserver(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    // Core Web Vitals observer
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.handlePerformanceEntry(entry);
        }
      });

      // Observe Core Web Vitals
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });

      // Observe navigation and paint metrics
      observer.observe({ entryTypes: ['navigation', 'paint'] });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }
  }

  private handlePerformanceEntry(entry: PerformanceEntry): void {
    if (typeof window === 'undefined') return;

    const currentMetrics: Partial<PerformanceMetrics> = {
      url: window.location.pathname,
      timestamp: Date.now(),
    };

    switch (entry.entryType) {
      case 'largest-contentful-paint':
        currentMetrics.lcp = entry.startTime;
        break;

      case 'first-input':
        currentMetrics.fid = (entry as any).processingStart - entry.startTime;
        break;

      case 'layout-shift':
        if (!(entry as any).hadRecentInput) {
          currentMetrics.cls = (currentMetrics.cls || 0) + (entry as any).value;
        }
        break;

      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          currentMetrics.fcp = entry.startTime;
        }
        break;

      case 'navigation':
        const navEntry = entry as PerformanceNavigationTiming;
        currentMetrics.ttfb = navEntry.responseStart - navEntry.requestStart;
        currentMetrics.domContentLoaded = navEntry.domContentLoadedEventEnd - navEntry.fetchStart;
        currentMetrics.loadComplete = navEntry.loadEventEnd - navEntry.fetchStart;
        break;
    }

    this.recordMetrics(currentMetrics);
  }

  private trackRouteChanges(): void {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        if (typeof performance !== 'undefined') {
          const routeChangeTime = performance.now() - this.navigationStartTime;

          this.recordMetrics({
            url: event.urlAfterRedirects,
            routeChangeTime,
            timestamp: Date.now(),
          });
        }
      });

    // Track navigation start
    this.router.events.subscribe(() => {
      if (typeof performance !== 'undefined') {
        this.navigationStartTime = performance.now();
      }
    });
  }

  private recordMetrics(metrics: Partial<PerformanceMetrics>): void {
    // Find existing metrics for this URL or create new
    const existingIndex = this.metrics.findIndex((m) => m.url === metrics.url);

    if (existingIndex >= 0) {
      // Merge with existing metrics
      this.metrics[existingIndex] = { ...this.metrics[existingIndex], ...metrics };
    } else {
      // Add new metrics
      this.metrics.push(metrics as PerformanceMetrics);
    }

    // Keep only last 50 entries to avoid memory issues
    if (this.metrics.length > 50) {
      this.metrics = this.metrics.slice(-50);
    }

    // Log to console in development
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.log('Performance Metrics:', metrics);
    }
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get metrics for specific URL
   */
  getMetricsForUrl(url: string): PerformanceMetrics | undefined {
    return this.metrics.find((m) => m.url === url);
  }

  /**
   * Get Core Web Vitals summary
   */
  getCoreWebVitals(): { lcp?: number; fid?: number; cls?: number } {
    const latest = this.metrics[this.metrics.length - 1];
    if (!latest) return {};

    return {
      lcp: latest.lcp,
      fid: latest.fid,
      cls: latest.cls,
    };
  }

  /**
   * Check if Core Web Vitals meet thresholds
   */
  getCoreWebVitalsStatus(): { lcp: string; fid: string; cls: string } {
    const vitals = this.getCoreWebVitals();

    return {
      lcp: this.getMetricStatus(vitals.lcp, 2500, 4000), // Good: <2.5s, Poor: >4s
      fid: this.getMetricStatus(vitals.fid, 100, 300), // Good: <100ms, Poor: >300ms
      cls: this.getMetricStatus(vitals.cls, 0.1, 0.25), // Good: <0.1, Poor: >0.25
    };
  }

  private getMetricStatus(
    value: number | undefined,
    goodThreshold: number,
    poorThreshold: number,
  ): string {
    if (value === undefined) return 'unknown';
    if (value <= goodThreshold) return 'good';
    if (value <= poorThreshold) return 'needs-improvement';
    return 'poor';
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }
}
