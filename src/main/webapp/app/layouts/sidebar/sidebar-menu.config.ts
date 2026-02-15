import { SidebarItem } from './sidebar-item.model';

export const SidebarMenuItems: SidebarItem[] = [
  // Direct link: Home
  {
    name: 'Home',
    route: '/',
    translationKey: 'global.menu.home',
    icon: 'home',
  },
  // Dropdown: Entities
  {
    name: 'Entities',
    translationKey: 'global.menu.entities.main',
    icon: 'th-list',
    isDropdown: true,
    dropdownId: 'entities',
    children: [
      {
        name: 'Tenant',
        route: '/tenant',
        translationKey: 'global.menu.entities.tenant',
        icon: 'building',
        authorities: ['ROLE_ADMIN'],
      },
      {
        name: 'Product',
        route: '/product',
        translationKey: 'global.menu.entities.product',
        icon: 'box',
      },
      {
        name: 'Vehicle',
        route: '/vehicle',
        translationKey: 'global.menu.entities.vehicle',
        icon: 'car',
      },
      {
        name: 'Driver',
        route: '/driver',
        translationKey: 'global.menu.entities.driver',
        icon: 'id-card',
      },
      {
        name: 'ProductionSite',
        route: '/production-site',
        translationKey: 'global.menu.entities.productionSite',
        icon: 'industry',
      },
      {
        name: 'Customer',
        route: '/customer',
        translationKey: 'global.menu.entities.customer',
        icon: 'users',
      },
      {
        name: 'Production',
        route: '/production',
        translationKey: 'global.menu.entities.production',
        icon: 'cogs',
      },
      {
        name: 'Delivery',
        route: '/delivery',
        translationKey: 'global.menu.entities.delivery',
        icon: 'truck',
      },
      {
        name: 'Round',
        route: '/round',
        translationKey: 'global.menu.entities.round',
        icon: 'route',
      },
      {
        name: 'Payment',
        route: '/payment',
        translationKey: 'global.menu.entities.payment',
        icon: 'credit-card',
      },
      {
        name: 'ProductReturn',
        route: '/product-return',
        translationKey: 'global.menu.entities.productReturn',
        icon: 'undo',
      },
      {
        name: 'Expense',
        route: '/expense',
        translationKey: 'global.menu.entities.expense',
        icon: 'receipt',
      },
    ],
  },
  // Dropdown: Administration (Admin only)
  {
    name: 'Admin',
    translationKey: 'global.menu.admin.main',
    icon: 'users-cog',
    authorities: ['ROLE_ADMIN'],
    isDropdown: true,
    dropdownId: 'admin',
    children: [
      {
        name: 'UserManagement',
        route: '/admin/user-management',
        translationKey: 'global.menu.admin.userManagement',
        icon: 'users-cog',
      },
      {
        name: 'Metrics',
        route: '/admin/metrics',
        translationKey: 'global.menu.admin.metrics',
        icon: 'tachometer-alt',
      },
      {
        name: 'Health',
        route: '/admin/health',
        translationKey: 'global.menu.admin.health',
        icon: 'heart',
      },
      {
        name: 'Configuration',
        route: '/admin/configuration',
        translationKey: 'global.menu.admin.configuration',
        icon: 'cogs',
      },
      {
        name: 'Logs',
        route: '/admin/logs',
        translationKey: 'global.menu.admin.logs',
        icon: 'tasks',
      },
      {
        name: 'API',
        route: '/admin/docs',
        translationKey: 'global.menu.admin.apidocs',
        icon: 'book',
      },
    ],
  },
];
