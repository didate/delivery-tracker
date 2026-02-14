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

describe('ReturnItem e2e test', () => {
  const returnItemPageUrl = '/return-item';
  const returnItemPageUrlPattern = new RegExp('/return-item(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  // const returnItemSample = {"quantity":23234.1};

  let returnItem;
  // let productReturn;
  // let product;

  beforeEach(() => {
    cy.login(username, password);
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/product-returns',
      body: {"returnDate":"2026-02-14","reason":"DAMAGED","notes":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ="},
    }).then(({ body }) => {
      productReturn = body;
    });
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/products',
      body: {"code":"du moment que","name":"parce que bzzz","description":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=","price":6922.91,"active":false},
    }).then(({ body }) => {
      product = body;
    });
  });
   */

  beforeEach(() => {
    cy.intercept('GET', '/api/return-items+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/return-items').as('postEntityRequest');
    cy.intercept('DELETE', '/api/return-items/*').as('deleteEntityRequest');
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/product-returns', {
      statusCode: 200,
      body: [productReturn],
    });

    cy.intercept('GET', '/api/products', {
      statusCode: 200,
      body: [product],
    });

  });
   */

  afterEach(() => {
    if (returnItem) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/return-items/${returnItem.id}`,
      }).then(() => {
        returnItem = undefined;
      });
    }
  });

  /* Disabled due to incompatibility
  afterEach(() => {
    if (productReturn) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/product-returns/${productReturn.id}`,
      }).then(() => {
        productReturn = undefined;
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
  });
   */

  it('ReturnItems menu should load ReturnItems page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('return-item');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('ReturnItem').should('exist');
    cy.url().should('match', returnItemPageUrlPattern);
  });

  describe('ReturnItem page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(returnItemPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create ReturnItem page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/return-item/new$'));
        cy.getEntityCreateUpdateHeading('ReturnItem');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', returnItemPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      /* Disabled due to incompatibility
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/return-items',
          body: {
            ...returnItemSample,
            productReturn: productReturn,
            product: product,
          },
        }).then(({ body }) => {
          returnItem = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/return-items+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/return-items?page=0&size=20>; rel="last",<http://localhost/api/return-items?page=0&size=20>; rel="first"',
              },
              body: [returnItem],
            }
          ).as('entitiesRequestInternal');
        });

        cy.visit(returnItemPageUrl);

        cy.wait('@entitiesRequestInternal');
      });
       */

      beforeEach(function () {
        cy.visit(returnItemPageUrl);

        cy.wait('@entitiesRequest').then(({ response }) => {
          if (response?.body.length === 0) {
            this.skip();
          }
        });
      });

      it('detail button click should load details ReturnItem page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('returnItem');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', returnItemPageUrlPattern);
      });

      it('edit button click should load edit ReturnItem page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('ReturnItem');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', returnItemPageUrlPattern);
      });

      it('edit button click should load edit ReturnItem page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('ReturnItem');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', returnItemPageUrlPattern);
      });

      // Reason: cannot create a required entity with relationship with required relationships.
      it.skip('last delete button click should delete instance of ReturnItem', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('returnItem').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', returnItemPageUrlPattern);

        returnItem = undefined;
      });
    });
  });

  describe('new ReturnItem page', () => {
    beforeEach(() => {
      cy.visit(returnItemPageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('ReturnItem');
    });

    // Reason: cannot create a required entity with relationship with required relationships.
    it.skip('should create an instance of ReturnItem', () => {
      cy.get(`[data-cy="quantity"]`).type('23256.71');
      cy.get(`[data-cy="quantity"]`).should('have.value', '23256.71');

      cy.get(`[data-cy="unitPrice"]`).type('14790.19');
      cy.get(`[data-cy="unitPrice"]`).should('have.value', '14790.19');

      cy.get(`[data-cy="productReturn"]`).select(1);
      cy.get(`[data-cy="product"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        returnItem = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', returnItemPageUrlPattern);
    });
  });
});
