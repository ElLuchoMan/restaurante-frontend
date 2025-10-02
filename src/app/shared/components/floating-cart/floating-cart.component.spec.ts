import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { CartService } from '../../../core/services/cart.service';
import { Producto } from '../../models/producto.model';
import { FloatingCartComponent } from './floating-cart.component';

describe('FloatingCartComponent', () => {
  let component: FloatingCartComponent;
  let fixture: ComponentFixture<FloatingCartComponent>;
  let mockCartService: any;
  let mockRouter: any;

  const mockProduct: Producto = {
    productoId: 1,
    nombre: 'Hamburguesa Clásica',
    descripcion: 'Deliciosa hamburguesa',
    precio: 25000,
    categoria: 'Platos Principales',
    subcategoria: 'Hamburguesas',
    calorias: 650,
    imagen: 'hamburguesa.jpg',
    cantidad: 1,
  };

  const mockCartItems = [
    {
      producto: mockProduct,
      cantidad: 2,
    },
  ];

  beforeEach(async () => {
    const cartServiceSpy = jasmine.createSpyObj('CartService', [
      'getCartItems',
      'updateQuantity',
      'removeFromCart',
      'clearCart',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [FloatingCartComponent],
      providers: [
        { provide: CartService, useValue: cartServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FloatingCartComponent);
    component = fixture.componentInstance;
    mockCartService = TestBed.inject(CartService);
    mockRouter = TestBed.inject(Router);

    // Setup default mock behavior
    mockCartService.items$ = of([mockProduct]);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load cart items and calculate totals', () => {
      component.ngOnInit();

      expect(component.cartItems).toEqual(mockCartItems);
      expect(component.totalItems).toBe(2);
      expect(component.totalPrice).toBe(50000);
    });
  });

  describe('toggleExpanded', () => {
    it('should toggle expanded state', () => {
      expect(component.isExpanded).toBeFalsy();

      component.toggleExpanded();
      expect(component.isExpanded).toBeTruthy();

      component.toggleExpanded();
      expect(component.isExpanded).toBeFalsy();
    });
  });

  describe('updateQuantity', () => {
    beforeEach(() => {
      component.cartItems = mockCartItems;
    });

    it('should increase quantity', () => {
      component.updateQuantity(1, 1);

      expect(mockCartService.updateQuantity).toHaveBeenCalledWith(1, 3);
    });

    it('should decrease quantity', () => {
      component.updateQuantity(1, -1);

      expect(mockCartService.updateQuantity).toHaveBeenCalledWith(1, 1);
    });

    it('should remove item when quantity reaches 0', () => {
      component.cartItems = [{ producto: mockProduct, cantidad: 1 }];

      component.updateQuantity(1, -1);

      expect(mockCartService.removeFromCart).toHaveBeenCalledWith(1);
    });

    it('should not update if item not found', () => {
      component.updateQuantity(999, 1);

      expect(mockCartService.updateQuantity).not.toHaveBeenCalled();
    });
  });

  describe('removeItem', () => {
    it('should remove item from cart', () => {
      component.removeItem(1);

      expect(mockCartService.removeFromCart).toHaveBeenCalledWith(1);
    });
  });

  describe('clearCart', () => {
    it('should clear cart and close panel', () => {
      component.isExpanded = true;

      component.clearCart();

      expect(mockCartService.clearCart).toHaveBeenCalled();
      expect(component.isExpanded).toBeFalsy();
    });
  });

  describe('goToCheckout', () => {
    it('should navigate to checkout and close panel', () => {
      component.isExpanded = true;

      component.goToCheckout();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/cliente/carrito-cliente']);
      expect(component.isExpanded).toBeFalsy();
    });
  });

  describe('calculateTotals', () => {
    it('should calculate correct totals', () => {
      component.cartItems = [
        { producto: { ...mockProduct, precio: 10000 }, cantidad: 2 },
        { producto: { ...mockProduct, precio: 15000 }, cantidad: 1 },
      ];

      component['calculateTotals']();

      expect(component.totalItems).toBe(3);
      expect(component.totalPrice).toBe(35000);
    });

    it('should handle empty cart', () => {
      component.cartItems = [];

      component['calculateTotals']();

      expect(component.totalItems).toBe(0);
      expect(component.totalPrice).toBe(0);
    });
  });

  describe('template rendering', () => {
    it('should show cart button when visible', () => {
      component.isVisible = true;
      fixture.detectChanges();

      const cartButton = fixture.nativeElement.querySelector('.cart-button');
      expect(cartButton).toBeTruthy();
    });

    it('should hide cart button when not visible', () => {
      component.isVisible = false;
      fixture.detectChanges();

      const cartButton = fixture.nativeElement.querySelector('.cart-button');
      expect(cartButton).toBeFalsy();
    });

    it('should show cart panel when expanded', () => {
      component.isExpanded = true;
      component.cartItems = mockCartItems;
      fixture.detectChanges();

      const cartPanel = fixture.nativeElement.querySelector('.cart-panel');
      expect(cartPanel).toBeTruthy();
    });

    it('should show empty cart message when no items', () => {
      component.isExpanded = true;
      component.cartItems = [];
      fixture.detectChanges();

      const emptyMessage = fixture.nativeElement.querySelector('.empty-cart');
      expect(emptyMessage).toBeTruthy();
    });

    it('should show cart items when available', () => {
      component.isExpanded = true;
      component.cartItems = mockCartItems;
      fixture.detectChanges();

      const cartItems = fixture.nativeElement.querySelectorAll('.cart-item');
      expect(cartItems.length).toBe(1);
    });

    it('should show cart badge with item count', () => {
      component.totalItems = 3;
      fixture.detectChanges();

      const badge = fixture.nativeElement.querySelector('.cart-badge');
      expect(badge).toBeTruthy();
      expect(badge.textContent.trim()).toBe('3');
    });

    it('should not show badge when no items', () => {
      component.totalItems = 0;
      fixture.detectChanges();

      const badge = fixture.nativeElement.querySelector('.cart-badge');
      expect(badge).toBeFalsy();
    });
  });

  describe('accessibility', () => {
    it('should have proper aria labels', () => {
      component.totalItems = 2;
      fixture.detectChanges();

      const cartButton = fixture.nativeElement.querySelector('.cart-button');
      expect(cartButton.getAttribute('aria-label')).toContain('Carrito con 2 productos');
    });

    it('should have proper aria expanded state', () => {
      component.isExpanded = true;
      fixture.detectChanges();

      const cartButton = fixture.nativeElement.querySelector('.cart-button');
      expect(cartButton.getAttribute('aria-expanded')).toBe('true');
    });
  });

  describe('ngOnDestroy', () => {
    it('should complete destroy subject', () => {
      const destroySpy = spyOn(component['destroy$'], 'next');
      const completeSpy = spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(destroySpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });
});
