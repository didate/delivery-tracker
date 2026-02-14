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

describe('Tenant e2e test', () => {
  const tenantPageUrl = '/tenant';
  const tenantPageUrlPattern = new RegExp('/tenant(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const tenantSample = { code: 'zzzz snob', name: 'étendre membre à vie', email: 'Adrastee_Laurent21@hotmail.fr', active: false };

  let tenant;

  beforeEach(() => {
    cy.login(username, password);
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/tenants+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/tenants').as('postEntityRequest');
    cy.intercept('DELETE', '/api/tenants/*').as('deleteEntityRequest');
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

  it('Tenants menu should load Tenants page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('tenant');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Tenant').should('exist');
    cy.url().should('match', tenantPageUrlPattern);
  });

  describe('Tenant page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(tenantPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Tenant page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/tenant/new$'));
        cy.getEntityCreateUpdateHeading('Tenant');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', tenantPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/tenants',
          body: tenantSample,
        }).then(({ body }) => {
          tenant = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/tenants+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/tenants?page=0&size=20>; rel="last",<http://localhost/api/tenants?page=0&size=20>; rel="first"',
              },
              body: [tenant],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(tenantPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details Tenant page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('tenant');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', tenantPageUrlPattern);
      });

      it('edit button click should load edit Tenant page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Tenant');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', tenantPageUrlPattern);
      });

      it('edit button click should load edit Tenant page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Tenant');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', tenantPageUrlPattern);
      });

      it('last delete button click should delete instance of Tenant', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('tenant').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', tenantPageUrlPattern);

        tenant = undefined;
      });
    });
  });

  describe('new Tenant page', () => {
    beforeEach(() => {
      cy.visit(tenantPageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Tenant');
    });

    it('should create an instance of Tenant', () => {
      cy.get(`[data-cy="code"]`).type('deçà trop');
      cy.get(`[data-cy="code"]`).should('have.value', 'deçà trop');

      cy.get(`[data-cy="name"]`).type('drelin retenir');
      cy.get(`[data-cy="name"]`).should('have.value', 'drelin retenir');

      cy.get(`[data-cy="email"]`).type('Hector32@gmail.com');
      cy.get(`[data-cy="email"]`).should('have.value', 'Hector32@gmail.com');

      cy.get(`[data-cy="phone"]`).type('0500847184');
      cy.get(`[data-cy="phone"]`).should('have.value', '0500847184');

      cy.get(`[data-cy="address"]`).type('../fake-data/blob/hipster.txt');
      cy.get(`[data-cy="address"]`).invoke('val').should('match', new RegExp('../fake-data/blob/hipster.txt'));

      cy.get(`[data-cy="logoUrl"]`).type('dès entièrement ha');
      cy.get(`[data-cy="logoUrl"]`).should('have.value', 'dès entièrement ha');

      cy.get(`[data-cy="active"]`).should('not.be.checked');
      cy.get(`[data-cy="active"]`).click();
      cy.get(`[data-cy="active"]`).should('be.checked');

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        tenant = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', tenantPageUrlPattern);
    });
  });
});
