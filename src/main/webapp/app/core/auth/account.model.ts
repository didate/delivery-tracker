export interface Account {
  activated: boolean;
  authorities: string[];
  email: string;
  firstName: string | null;
  langKey: string;
  lastName: string | null;
  login: string;
  imageUrl: string | null;
  tenantId?: number | null;
  tenantName?: string | null;
}

/**
 * Check if the account has the ADMIN authority.
 */
export function hasAdminAuthority(account: Account | null): boolean {
  return account?.authorities?.includes('ROLE_ADMIN') ?? false;
}
