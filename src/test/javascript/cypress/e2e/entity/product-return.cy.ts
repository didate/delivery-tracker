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

describe('ProductReturn e2e test', () => {
  const productReturnPageUrl = '/product-return';
  const productReturnPageUrlPattern = new RegExp('/product-return(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  // const productReturnSample = {"returnDate":"2026-02-13","reason":"DAMAGED"};

  let productReturn;
  // let tenant;
  // let customer;

  beforeEach(() => {
    cy.login(username, password);
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/tenants',
      body: {"code":"dispenser","name":"snob partenaire drelin","email":"Mireille22@gmail.com","phone":"0793178033","address":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=","logoUrl":"subito aux environs de paf","active":true},
    }).then(({ body }) => {
      tenant = body;
    });
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/customers',
      body: {"code":"altruiste sourire atchoum","name":"à l'entour de magnifique","phone":"+33 243482447","email":"Frederique50@hotmail.fr","address":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=","latitude":11044.84,"longitude":4840.06,"active":true,"notes":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ="},
    }).then(({ body }) => {
      customer = body;
    });
  });
   */

  beforeEach(() => {
    cy.intercept('GET', '/api/product-returns+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/product-returns').as('postEntityRequest');
    cy.intercept('DELETE', '/api/product-returns/*').as('deleteEntityRequest');
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/tenants', {
      statusCode: 200,
      body: [tenant],
    });

    cy.intercept('GET', '/api/customers', {
      statusCode: 200,
      body: [customer],
    });

    cy.intercept('GET', '/api/deliveries', {
      statusCode: 200,
      body: [],
    });

  });
   */

  afterEach(() => {
    if (productReturn) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/product-returns/${productReturn.id}`,
      }).then(() => {
        productReturn = undefined;
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
    if (customer) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/customers/${customer.id}`,
      }).then(() => {
        customer = undefined;
      });
    }
  });
   */

  it('ProductReturns menu should load ProductReturns page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('product-return');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('ProductReturn').should('exist');
    cy.url().should('match', productReturnPageUrlPattern);
  });

  describe('ProductReturn page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(productReturnPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create ProductReturn page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/product-return/new$'));
        cy.getEntityCreateUpdateHeading('ProductReturn');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', productReturnPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      /* Disabled due to incompatibility
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/product-returns',
          body: {
            ...productReturnSample,
            tenant: tenant,
            customer: customer,
          },
        }).then(({ body }) => {
          productReturn = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/product-returns+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/product-returns?page=0&size=20>; rel="last",<http://localhost/api/product-returns?page=0&size=20>; rel="first"',
              },
              body: [productReturn],
            }
          ).as('entitiesRequestInternal');
        });

        cy.visit(productReturnPageUrl);

        cy.wait('@entitiesRequestInternal');
      });
       */

      beforeEach(function () {
        cy.visit(productReturnPageUrl);

        cy.wait('@entitiesRequest').then(({ response }) => {
          if (response?.body.length === 0) {
            this.skip();
          }
        });
      });

      it('detail button click should load details ProductReturn page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('productReturn');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', productReturnPageUrlPattern);
      });

      it('edit button click should load edit ProductReturn page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('ProductReturn');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', productReturnPageUrlPattern);
      });

      it('edit button click should load edit ProductReturn page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('ProductReturn');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', productReturnPageUrlPattern);
      });

      // Reason: cannot create a required entity with relationship with required relationships.
      it.skip('last delete button click should delete instance of ProductReturn', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('productReturn').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', productReturnPageUrlPattern);

        productReturn = undefined;
      });
    });
  });

  describe('new ProductReturn page', () => {
    beforeEach(() => {
      cy.visit(productReturnPageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('ProductReturn');
    });

    // Reason: cannot create a required entity with relationship with required relationships.
    it.skip('should create an instance of ProductReturn', () => {
      cy.get(`[data-cy="returnDate"]`).type('2026-02-14');
      cy.get(`[data-cy="returnDate"]`).blur();
      cy.get(`[data-cy="returnDate"]`).should('have.value', '2026-02-14');

      cy.get(`[data-cy="reason"]`).select('CUSTOMER_REFUSAL');

      cy.get(`[data-cy="notes"]`).type('../fake-data/blob/hipster.txt');
      cy.get(`[data-cy="notes"]`).invoke('val').should('match', new RegExp('../fake-data/blob/hipster.txt'));

      cy.get(`[data-cy="tenant"]`).select(1);
      cy.get(`[data-cy="customer"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        productReturn = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', productReturnPageUrlPattern);
    });
  });
});
