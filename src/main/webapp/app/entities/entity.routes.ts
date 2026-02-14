import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'authority',
    data: { pageTitle: 'deliveryApp.adminAuthority.home.title' },
    loadChildren: () => import('./admin/authority/authority.routes'),
  },
  {
    path: 'tenant',
    data: { pageTitle: 'deliveryApp.tenant.home.title' },
    loadChildren: () => import('./tenant/tenant.routes'),
  },
  {
    path: 'tenant-settings',
    data: { pageTitle: 'deliveryApp.tenantSettings.home.title' },
    loadChildren: () => import('./tenant-settings/tenant-settings.routes'),
  },
  {
    path: 'product',
    data: { pageTitle: 'deliveryApp.product.home.title' },
    loadChildren: () => import('./product/product.routes'),
  },
  {
    path: 'price-history',
    data: { pageTitle: 'deliveryApp.priceHistory.home.title' },
    loadChildren: () => import('./price-history/price-history.routes'),
  },
  {
    path: 'vehicle',
    data: { pageTitle: 'deliveryApp.vehicle.home.title' },
    loadChildren: () => import('./vehicle/vehicle.routes'),
  },
  {
    path: 'driver',
    data: { pageTitle: 'deliveryApp.driver.home.title' },
    loadChildren: () => import('./driver/driver.routes'),
  },
  {
    path: 'production-site',
    data: { pageTitle: 'deliveryApp.productionSite.home.title' },
    loadChildren: () => import('./production-site/production-site.routes'),
  },
  {
    path: 'customer',
    data: { pageTitle: 'deliveryApp.customer.home.title' },
    loadChildren: () => import('./customer/customer.routes'),
  },
  {
    path: 'production',
    data: { pageTitle: 'deliveryApp.production.home.title' },
    loadChildren: () => import('./production/production.routes'),
  },
  {
    path: 'delivery',
    data: { pageTitle: 'deliveryApp.delivery.home.title' },
    loadChildren: () => import('./delivery/delivery.routes'),
  },
  {
    path: 'delivery-item',
    data: { pageTitle: 'deliveryApp.deliveryItem.home.title' },
    loadChildren: () => import('./delivery-item/delivery-item.routes'),
  },
  {
    path: 'round',
    data: { pageTitle: 'deliveryApp.round.home.title' },
    loadChildren: () => import('./round/round.routes'),
  },
  {
    path: 'round-customer',
    data: { pageTitle: 'deliveryApp.roundCustomer.home.title' },
    loadChildren: () => import('./round-customer/round-customer.routes'),
  },
  {
    path: 'payment',
    data: { pageTitle: 'deliveryApp.payment.home.title' },
    loadChildren: () => import('./payment/payment.routes'),
  },
  {
    path: 'product-return',
    data: { pageTitle: 'deliveryApp.productReturn.home.title' },
    loadChildren: () => import('./product-return/product-return.routes'),
  },
  {
    path: 'return-item',
    data: { pageTitle: 'deliveryApp.returnItem.home.title' },
    loadChildren: () => import('./return-item/return-item.routes'),
  },
  {
    path: 'expense-category',
    data: { pageTitle: 'deliveryApp.expenseCategory.home.title' },
    loadChildren: () => import('./expense-category/expense-category.routes'),
  },
  {
    path: 'expense',
    data: { pageTitle: 'deliveryApp.expense.home.title' },
    loadChildren: () => import('./expense/expense.routes'),
  },
  /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
];

export default routes;
