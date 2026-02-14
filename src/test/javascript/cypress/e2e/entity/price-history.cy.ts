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

describe('PriceHistory e2e test', () => {
  const priceHistoryPageUrl = '/price-history';
  const priceHistoryPageUrlPattern = new RegExp('/price-history(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  // const priceHistorySample = {"price":27787.15,"effectiveDate":"2026-02-13"};

  let priceHistory;
  // let product;

  beforeEach(() => {
    cy.login(username, password);
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/products',
      body: {"code":"après","name":"plus","description":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=","price":22643.14,"active":true},
    }).then(({ body }) => {
      product = body;
    });
  });
   */

  beforeEach(() => {
    cy.intercept('GET', '/api/price-histories+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/price-histories').as('postEntityRequest');
    cy.intercept('DELETE', '/api/price-histories/*').as('deleteEntityRequest');
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/products', {
      statusCode: 200,
      body: [product],
    });

  });
   */

  afterEach(() => {
    if (priceHistory) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/price-histories/${priceHistory.id}`,
      }).then(() => {
        priceHistory = undefined;
      });
    }
  });

  /* Disabled due to incompatibility
  afterEach(() => {
    if (product) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/products/${product.id}`,
      }).then(() => {
        product = undefined;
      });
    }
  });
   */

  it('PriceHistories menu should load PriceHistories page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('price-history');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('PriceHistory').should('exist');
    cy.url().should('match', priceHistoryPageUrlPattern);
  });

  describe('PriceHistory page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(priceHistoryPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create PriceHistory page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/price-history/new$'));
        cy.getEntityCreateUpdateHeading('PriceHistory');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', priceHistoryPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      /* Disabled due to incompatibility
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/price-histories',
          body: {
            ...priceHistorySample,
            product: product,
          },
        }).then(({ body }) => {
          priceHistory = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/price-histories+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/price-histories?page=0&size=20>; rel="last",<http://localhost/api/price-histories?page=0&size=20>; rel="first"',
              },
              body: [priceHistory],
            }
          ).as('entitiesRequestInternal');
        });

        cy.visit(priceHistoryPageUrl);

        cy.wait('@entitiesRequestInternal');
      });
       */

      beforeEach(function () {
        cy.visit(priceHistoryPageUrl);

        cy.wait('@entitiesRequest').then(({ response }) => {
          if (response?.body.length === 0) {
            this.skip();
          }
        });
      });

      it('detail button click should load details PriceHistory page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('priceHistory');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', priceHistoryPageUrlPattern);
      });

      it('edit button click should load edit PriceHistory page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('PriceHistory');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', priceHistoryPageUrlPattern);
      });

      it('edit button click should load edit PriceHistory page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('PriceHistory');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', priceHistoryPageUrlPattern);
      });

      // Reason: cannot create a required entity with relationship with required relationships.
      it.skip('last delete button click should delete instance of PriceHistory', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('priceHistory').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', priceHistoryPageUrlPattern);

        priceHistory = undefined;
      });
    });
  });

  describe('new PriceHistory page', () => {
    beforeEach(() => {
      cy.visit(priceHistoryPageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('PriceHistory');
    });

    // Reason: cannot create a required entity with relationship with required relationships.
    it.skip('should create an instance of PriceHistory', () => {
      cy.get(`[data-cy="price"]`).type('15128.74');
      cy.get(`[data-cy="price"]`).should('have.value', '15128.74');

      cy.get(`[data-cy="effectiveDate"]`).type('2026-02-14');
      cy.get(`[data-cy="effectiveDate"]`).blur();
      cy.get(`[data-cy="effectiveDate"]`).should('have.value', '2026-02-14');

      cy.get(`[data-cy="product"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        priceHistory = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', priceHistoryPageUrlPattern);
    });
  });
});
