import {
  entityConfirmDeleteButtonSelector,
  entityCreateButtonSelector,
  entityCreateCancelButtonSelector,
  entityCreateSaveButtonSelector,
  entityDeleteButtonSelector,
  entityDetailsBackButtonSelector,
  entityDetailsButtonSelector,
  entityEditButtonSelector,
  entityTableSelector,
} from '../../support/entity';

describe('TenantSettings e2e test', () => {
  const tenantSettingsPageUrl = '/tenant-settings';
  const tenantSettingsPageUrlPattern = new RegExp('/tenant-settings(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const tenantSettingsSample = {};

  let tenantSettings;
  let tenant;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/tenants',
      body: {
        code: 'psitt',
        name: "à l'encontre de abaisser",
        email: 'Athanase.Marchal@yahoo.fr',
        phone: '+33 723261067',
        address: 'Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=',
        logoUrl: "pendant que derrière à l'insu de",
        active: true,
      },
    }).then(({ body }) => {
      tenant = body;
    });
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/tenant-settings+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/tenant-settings').as('postEntityRequest');
    cy.intercept('DELETE', '/api/tenant-settings/*').as('deleteEntityRequest');
  });

  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/tenants', {
      statusCode: 200,
      body: [tenant],
    });
  });

  afterEach(() => {
    if (tenantSettings) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/tenant-settings/${tenantSettings.id}`,
      }).then(() => {
        tenantSettings = undefined;
      });
    }
  });

  afterEach(() => {
    if (tenant) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/tenants/${tenant.id}`,
      }).then(() => {
        tenant = undefined;
      });
    }
  });

  it('TenantSettings menu should load TenantSettings page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('tenant-settings');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('TenantSettings').should('exist');
    cy.url().should('match', tenantSettingsPageUrlPattern);
  });

  describe('TenantSettings page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(tenantSettingsPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create TenantSettings page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/tenant-settings/new$'));
        cy.getEntityCreateUpdateHeading('TenantSettings');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', tenantSettingsPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/tenant-settings',
          body: {
            ...tenantSettingsSample,
            tenant,
          },
        }).then(({ body }) => {
          tenantSettings = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/tenant-settings+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/tenant-settings?page=0&size=20>; rel="last",<http://localhost/api/tenant-settings?page=0&size=20>; rel="first"',
              },
              body: [tenantSettings],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(tenantSettingsPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details TenantSettings page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('tenantSettings');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', tenantSettingsPageUrlPattern);
      });

      it('edit button click should load edit TenantSettings page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('TenantSettings');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', tenantSettingsPageUrlPattern);
      });

      it('edit button click should load edit TenantSettings page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('TenantSettings');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', tenantSettingsPageUrlPattern);
      });

      it('last delete button click should delete instance of TenantSettings', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('tenantSettings').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', tenantSettingsPageUrlPattern);

        tenantSettings = undefined;
      });
    });
  });

  describe('new TenantSettings page', () => {
    beforeEach(() => {
      cy.visit(tenantSettingsPageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('TenantSettings');
    });

    it('should create an instance of TenantSettings', () => {
      cy.get(`[data-cy="currency"]`).type('pos');
      cy.get(`[data-cy="currency"]`).should('have.value', 'pos');

      cy.get(`[data-cy="timezone"]`).type('chef de cuisine');
      cy.get(`[data-cy="timezone"]`).should('have.value', 'chef de cuisine');

      cy.get(`[data-cy="dateFormat"]`).type('hystérique avant sou');
      cy.get(`[data-cy="dateFormat"]`).should('have.value', 'hystérique avant sou');

      cy.get(`[data-cy="language"]`).type('antagonist');
      cy.get(`[data-cy="language"]`).should('have.value', 'antagonist');

      cy.get(`[data-cy="tenant"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        tenantSettings = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', tenantSettingsPageUrlPattern);
    });
  });
});
