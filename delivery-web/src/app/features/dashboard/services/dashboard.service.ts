import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { CustomerService } from '../../customers/services/customer.service';
import { ProductService } from '../../products/services/product.service';
import { DriverService } from '../../drivers/services/driver.service';
import { DeliveryService } from '../../deliveries/services/delivery.service';
import { ReturnService } from '../../returns/services/return.service';
import { PaymentService } from '../../payments/services/payment.service';

export interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  activeDrivers: number;
  todayDeliveries: number;
  pendingReturns: number;
  monthlyRevenue: number;
}

export interface RecentDelivery {
  id: number;
  code: string;
  customerName: string;
  status: string;
  deliveryDate: string;
  totalAmount: number;
}

export interface RecentPayment {
  id: number;
  code: string;
  customerName: string;
  amount: number;
  paymentDate: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly customerService = inject(CustomerService);
  private readonly productService = inject(ProductService);
  private readonly driverService = inject(DriverService);
  private readonly deliveryService = inject(DeliveryService);
  private readonly returnService = inject(ReturnService);
  private readonly paymentService = inject(PaymentService);

  getDashboardStats(): Observable<DashboardStats> {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfMonthStr = startOfMonth.toISOString().split('T')[0];

    return forkJoin({
      customers: this.customerService.getCustomers({ page: 0, size: 1 }),
      products: this.productService.getProducts({ page: 0, size: 1 }),
      drivers: this.driverService.getDrivers({ page: 0, size: 1, active: true }),
      todayDeliveries: this.deliveryService.getDeliveries({
        page: 0,
        size: 1,
        startDate: todayStr,
        endDate: todayStr
      }),
      pendingReturns: this.returnService.getReturns({
        page: 0,
        size: 1,
        status: 'PENDING'
      }),
      monthlyPayments: this.paymentService.getPayments({
        page: 0,
        size: 1000,
        startDate: startOfMonthStr,
        endDate: todayStr
      })
    }).pipe(
      map(results => ({
        totalCustomers: results.customers.total,
        totalProducts: results.products.total,
        activeDrivers: results.drivers.total,
        todayDeliveries: results.todayDeliveries.total,
        pendingReturns: results.pendingReturns.total,
        monthlyRevenue: results.monthlyPayments.data.reduce((sum, p) => sum + p.amount, 0)
      }))
    );
  }

  getRecentDeliveries(): Observable<RecentDelivery[]> {
    return this.deliveryService.getDeliveries({ page: 0, size: 5 }).pipe(
      map(response => response.data.map(d => ({
        id: d.id,
        code: d.code,
        customerName: d.customerName,
        status: d.status,
        deliveryDate: d.deliveryDate,
        totalAmount: d.totalAmount
      })))
    );
  }

  getRecentPayments(): Observable<RecentPayment[]> {
    return this.paymentService.getPayments({ page: 0, size: 5 }).pipe(
      map(response => response.data.map(p => ({
        id: p.id,
        code: p.code,
        customerName: p.customerName,
        amount: p.amount,
        paymentDate: p.paymentDate
      })))
    );
  }
}
