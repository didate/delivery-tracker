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

describe('Production e2e test', () => {
  const productionPageUrl = '/production';
  const productionPageUrlPattern = new RegExp('/production(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  // const productionSample = {"productionDate":"2026-02-14","quantity":8341.8};

  let production;
  // let tenant;
  // let product;
  // let productionSite;

  beforeEach(() => {
    cy.login(username, password);
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/tenants',
      body: {"code":"équipe tant que à la","name":"émouvoir","email":"Alize.Blanc@yahoo.fr","phone":"0505699941","address":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=","logoUrl":"autrefois diététiste sincère","active":false},
    }).then(({ body }) => {
      tenant = body;
    });
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/products',
      body: {"code":"annoncer à l'instar ","name":"ha au dépens de","description":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=","price":2895.51,"active":false},
    }).then(({ body }) => {
      product = body;
    });
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/production-sites',
      body: {"code":"magnifique malade re","name":"si miam","address":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=","phone":"0305420477","active":false},
    }).then(({ body }) => {
      productionSite = body;
    });
  });
   */

  beforeEach(() => {
    cy.intercept('GET', '/api/productions+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/productions').as('postEntityRequest');
    cy.intercept('DELETE', '/api/productions/*').as('deleteEntityRequest');
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/tenants', {
      statusCode: 200,
      body: [tenant],
    });

    cy.intercept('GET', '/api/products', {
      statusCode: 200,
      body: [product],
    });

    cy.intercept('GET', '/api/production-sites', {
      statusCode: 200,
      body: [productionSite],
    });

  });
   */

  afterEach(() => {
    if (production) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/productions/${production.id}`,
      }).then(() => {
        production = undefined;
      });
    }
  });

  /* Disabled due to incompatibility
  afterEach(() => {
    if (tenant) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/tenants/${tenant.id}`,
      }).then(() => {
        tenant = undefined;
      });
    }
    if (product) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/products/${product.id}`,
      }).then(() => {
        product = undefined;
      });
    }
    if (productionSite) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/production-sites/${productionSite.id}`,
      }).then(() => {
        productionSite = undefined;
      });
    }
  });
   */

  it('Productions menu should load Productions page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('production');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Production').should('exist');
    cy.url().should('match', productionPageUrlPattern);
  });

  describe('Production page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(productionPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Production page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/production/new$'));
        cy.getEntityCreateUpdateHeading('Production');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', productionPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      /* Disabled due to incompatibility
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/productions',
          body: {
            ...productionSample,
            tenant: tenant,
            product: product,
            productionSite: productionSite,
          },
        }).then(({ body }) => {
          production = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/productions+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/productions?page=0&size=20>; rel="last",<http://localhost/api/productions?page=0&size=20>; rel="first"',
              },
              body: [production],
            }
          ).as('entitiesRequestInternal');
        });

        cy.visit(productionPageUrl);

        cy.wait('@entitiesRequestInternal');
      });
       */

      beforeEach(function () {
        cy.visit(productionPageUrl);

        cy.wait('@entitiesRequest').then(({ response }) => {
          if (response?.body.length === 0) {
            this.skip();
          }
        });
      });

      it('detail button click should load details Production page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('production');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', productionPageUrlPattern);
      });

      it('edit button click should load edit Production page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Production');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', productionPageUrlPattern);
      });

      it('edit button click should load edit Production page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Production');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', productionPageUrlPattern);
      });

      // Reason: cannot create a required entity with relationship with required relationships.
      it.skip('last delete button click should delete instance of Production', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('production').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', productionPageUrlPattern);

        production = undefined;
      });
    });
  });

  describe('new Production page', () => {
    beforeEach(() => {
      cy.visit(productionPageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Production');
    });

    // Reason: cannot create a required entity with relationship with required relationships.
    it.skip('should create an instance of Production', () => {
      cy.get(`[data-cy="productionDate"]`).type('2026-02-13');
      cy.get(`[data-cy="productionDate"]`).blur();
      cy.get(`[data-cy="productionDate"]`).should('have.value', '2026-02-13');

      cy.get(`[data-cy="quantity"]`).type('3401.36');
      cy.get(`[data-cy="quantity"]`).should('have.value', '3401.36');

      cy.get(`[data-cy="notes"]`).type('../fake-data/blob/hipster.txt');
      cy.get(`[data-cy="notes"]`).invoke('val').should('match', new RegExp('../fake-data/blob/hipster.txt'));

      cy.get(`[data-cy="tenant"]`).select(1);
      cy.get(`[data-cy="product"]`).select(1);
      cy.get(`[data-cy="productionSite"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        production = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', productionPageUrlPattern);
    });
  });
});
