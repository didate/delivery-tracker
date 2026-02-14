export interface SidebarItem {
  name: string;
  route?: string;
  translationKey: string;
  icon: string;
  authorities?: string[];
  isDropdown?: boolean;
  dropdownId?: string;
  children?: SidebarChildItem[];
}

export interface SidebarChildItem {
  name: string;
  route?: string;
  translationKey: string;
  icon: string;
  authorities?: string[];
  actionType?: 'route' | 'logout' | 'language';
}
