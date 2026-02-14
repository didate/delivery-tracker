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

describe('DeliveryItem e2e test', () => {
  const deliveryItemPageUrl = '/delivery-item';
  const deliveryItemPageUrlPattern = new RegExp('/delivery-item(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  // const deliveryItemSample = {"quantity":1302.41,"unitPrice":27965.78};

  let deliveryItem;
  // let delivery;
  // let product;

  beforeEach(() => {
    cy.login(username, password);
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/deliveries',
      body: {"deliveryDate":"2026-02-14","status":"IN_PROGRESS","totalAmount":18720.34,"paidAmount":23999.22,"notes":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ="},
    }).then(({ body }) => {
      delivery = body;
    });
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/products',
      body: {"code":"alors que que semer","name":"gai conseil d’administration","description":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=","price":16033.71,"active":false},
    }).then(({ body }) => {
      product = body;
    });
  });
   */

  beforeEach(() => {
    cy.intercept('GET', '/api/delivery-items+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/delivery-items').as('postEntityRequest');
    cy.intercept('DELETE', '/api/delivery-items/*').as('deleteEntityRequest');
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/deliveries', {
      statusCode: 200,
      body: [delivery],
    });

    cy.intercept('GET', '/api/products', {
      statusCode: 200,
      body: [product],
    });

  });
   */

  afterEach(() => {
    if (deliveryItem) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/delivery-items/${deliveryItem.id}`,
      }).then(() => {
        deliveryItem = undefined;
      });
    }
  });

  /* Disabled due to incompatibility
  afterEach(() => {
    if (delivery) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/deliveries/${delivery.id}`,
      }).then(() => {
        delivery = undefined;
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

  it('DeliveryItems menu should load DeliveryItems page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('delivery-item');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('DeliveryItem').should('exist');
    cy.url().should('match', deliveryItemPageUrlPattern);
  });

  describe('DeliveryItem page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(deliveryItemPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create DeliveryItem page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/delivery-item/new$'));
        cy.getEntityCreateUpdateHeading('DeliveryItem');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', deliveryItemPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      /* Disabled due to incompatibility
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/delivery-items',
          body: {
            ...deliveryItemSample,
            delivery: delivery,
            product: product,
          },
        }).then(({ body }) => {
          deliveryItem = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/delivery-items+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/delivery-items?page=0&size=20>; rel="last",<http://localhost/api/delivery-items?page=0&size=20>; rel="first"',
              },
              body: [deliveryItem],
            }
          ).as('entitiesRequestInternal');
        });

        cy.visit(deliveryItemPageUrl);

        cy.wait('@entitiesRequestInternal');
      });
       */

      beforeEach(function () {
        cy.visit(deliveryItemPageUrl);

        cy.wait('@entitiesRequest').then(({ response }) => {
          if (response?.body.length === 0) {
            this.skip();
          }
        });
      });

      it('detail button click should load details DeliveryItem page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('deliveryItem');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', deliveryItemPageUrlPattern);
      });

      it('edit button click should load edit DeliveryItem page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('DeliveryItem');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', deliveryItemPageUrlPattern);
      });

      it('edit button click should load edit DeliveryItem page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('DeliveryItem');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', deliveryItemPageUrlPattern);
      });

      // Reason: cannot create a required entity with relationship with required relationships.
      it.skip('last delete button click should delete instance of DeliveryItem', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('deliveryItem').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', deliveryItemPageUrlPattern);

        deliveryItem = undefined;
      });
    });
  });

  describe('new DeliveryItem page', () => {
    beforeEach(() => {
      cy.visit(deliveryItemPageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('DeliveryItem');
    });

    // Reason: cannot create a required entity with relationship with required relationships.
    it.skip('should create an instance of DeliveryItem', () => {
      cy.get(`[data-cy="quantity"]`).type('22592.53');
      cy.get(`[data-cy="quantity"]`).should('have.value', '22592.53');

      cy.get(`[data-cy="unitPrice"]`).type('4235.31');
      cy.get(`[data-cy="unitPrice"]`).should('have.value', '4235.31');

      cy.get(`[data-cy="totalPrice"]`).type('13377.04');
      cy.get(`[data-cy="totalPrice"]`).should('have.value', '13377.04');

      cy.get(`[data-cy="delivery"]`).select(1);
      cy.get(`[data-cy="product"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        deliveryItem = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', deliveryItemPageUrlPattern);
    });
  });
});
