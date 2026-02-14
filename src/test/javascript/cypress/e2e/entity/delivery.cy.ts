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

describe('Delivery e2e test', () => {
  const deliveryPageUrl = '/delivery';
  const deliveryPageUrlPattern = new RegExp('/delivery(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  // const deliverySample = {"deliveryDate":"2026-02-14","status":"IN_PROGRESS"};

  let delivery;
  // let tenant;
  // let customer;
  // let driver;

  beforeEach(() => {
    cy.login(username, password);
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/tenants',
      body: {"code":"glouglou marcher par","name":"rectangulaire parce que","email":"Apolline29@hotmail.fr","phone":"+33 504273775","address":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=","logoUrl":"oh rose tic-tac","active":false},
    }).then(({ body }) => {
      tenant = body;
    });
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/customers',
      body: {"code":"avant probablement","name":"commissionnaire","phone":"0535378175","email":"Charles99@yahoo.fr","address":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=","latitude":25384.83,"longitude":29966.31,"active":true,"notes":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ="},
    }).then(({ body }) => {
      customer = body;
    });
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/drivers',
      body: {"code":"sale areu areu puis","name":"avant-hier","phone":"0276447038","email":"Felicie_Nguyen@yahoo.fr","licenseNumber":"blême partout","active":true},
    }).then(({ body }) => {
      driver = body;
    });
  });
   */

  beforeEach(() => {
    cy.intercept('GET', '/api/deliveries+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/deliveries').as('postEntityRequest');
    cy.intercept('DELETE', '/api/deliveries/*').as('deleteEntityRequest');
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

    cy.intercept('GET', '/api/drivers', {
      statusCode: 200,
      body: [driver],
    });

  });
   */

  afterEach(() => {
    if (delivery) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/deliveries/${delivery.id}`,
      }).then(() => {
        delivery = undefined;
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
    if (driver) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/drivers/${driver.id}`,
      }).then(() => {
        driver = undefined;
      });
    }
  });
   */

  it('Deliveries menu should load Deliveries page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('delivery');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Delivery').should('exist');
    cy.url().should('match', deliveryPageUrlPattern);
  });

  describe('Delivery page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(deliveryPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Delivery page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/delivery/new$'));
        cy.getEntityCreateUpdateHeading('Delivery');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', deliveryPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      /* Disabled due to incompatibility
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/deliveries',
          body: {
            ...deliverySample,
            tenant: tenant,
            customer: customer,
            driver: driver,
          },
        }).then(({ body }) => {
          delivery = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/deliveries+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/deliveries?page=0&size=20>; rel="last",<http://localhost/api/deliveries?page=0&size=20>; rel="first"',
              },
              body: [delivery],
            }
          ).as('entitiesRequestInternal');
        });

        cy.visit(deliveryPageUrl);

        cy.wait('@entitiesRequestInternal');
      });
       */

      beforeEach(function () {
        cy.visit(deliveryPageUrl);

        cy.wait('@entitiesRequest').then(({ response }) => {
          if (response?.body.length === 0) {
            this.skip();
          }
        });
      });

      it('detail button click should load details Delivery page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('delivery');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', deliveryPageUrlPattern);
      });

      it('edit button click should load edit Delivery page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Delivery');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', deliveryPageUrlPattern);
      });

      it('edit button click should load edit Delivery page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Delivery');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', deliveryPageUrlPattern);
      });

      // Reason: cannot create a required entity with relationship with required relationships.
      it.skip('last delete button click should delete instance of Delivery', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('delivery').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', deliveryPageUrlPattern);

        delivery = undefined;
      });
    });
  });

  describe('new Delivery page', () => {
    beforeEach(() => {
      cy.visit(deliveryPageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Delivery');
    });

    // Reason: cannot create a required entity with relationship with required relationships.
    it.skip('should create an instance of Delivery', () => {
      cy.get(`[data-cy="deliveryDate"]`).type('2026-02-14');
      cy.get(`[data-cy="deliveryDate"]`).blur();
      cy.get(`[data-cy="deliveryDate"]`).should('have.value', '2026-02-14');

      cy.get(`[data-cy="status"]`).select('PENDING');

      cy.get(`[data-cy="totalAmount"]`).type('19617.43');
      cy.get(`[data-cy="totalAmount"]`).should('have.value', '19617.43');

      cy.get(`[data-cy="paidAmount"]`).type('19240.31');
      cy.get(`[data-cy="paidAmount"]`).should('have.value', '19240.31');

      cy.get(`[data-cy="notes"]`).type('../fake-data/blob/hipster.txt');
      cy.get(`[data-cy="notes"]`).invoke('val').should('match', new RegExp('../fake-data/blob/hipster.txt'));

      cy.get(`[data-cy="tenant"]`).select(1);
      cy.get(`[data-cy="customer"]`).select(1);
      cy.get(`[data-cy="driver"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        delivery = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', deliveryPageUrlPattern);
    });
  });
});
