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

describe('RoundCustomer e2e test', () => {
  const roundCustomerPageUrl = '/round-customer';
  const roundCustomerPageUrlPattern = new RegExp('/round-customer(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  // const roundCustomerSample = {"sequenceOrder":17789};

  let roundCustomer;
  // let round;
  // let customer;

  beforeEach(() => {
    cy.login(username, password);
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/rounds',
      body: {"name":"concurrence sauvage que","roundDate":"2026-02-14","status":"PLANNED","startTime":"2026-02-13T21:35:33.078Z","endTime":"2026-02-14T04:02:08.656Z","notes":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ="},
    }).then(({ body }) => {
      round = body;
    });
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/customers',
      body: {"code":"dans la mesure où","name":"parce que","phone":"0577907546","email":"Ines30@gmail.com","address":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=","latitude":11835.16,"longitude":3497.63,"active":true,"notes":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ="},
    }).then(({ body }) => {
      customer = body;
    });
  });
   */

  beforeEach(() => {
    cy.intercept('GET', '/api/round-customers+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/round-customers').as('postEntityRequest');
    cy.intercept('DELETE', '/api/round-customers/*').as('deleteEntityRequest');
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/rounds', {
      statusCode: 200,
      body: [round],
    });

    cy.intercept('GET', '/api/customers', {
      statusCode: 200,
      body: [customer],
    });

  });
   */

  afterEach(() => {
    if (roundCustomer) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/round-customers/${roundCustomer.id}`,
      }).then(() => {
        roundCustomer = undefined;
      });
    }
  });

  /* Disabled due to incompatibility
  afterEach(() => {
    if (round) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/rounds/${round.id}`,
      }).then(() => {
        round = undefined;
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

  it('RoundCustomers menu should load RoundCustomers page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('round-customer');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('RoundCustomer').should('exist');
    cy.url().should('match', roundCustomerPageUrlPattern);
  });

  describe('RoundCustomer page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(roundCustomerPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create RoundCustomer page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/round-customer/new$'));
        cy.getEntityCreateUpdateHeading('RoundCustomer');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', roundCustomerPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      /* Disabled due to incompatibility
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/round-customers',
          body: {
            ...roundCustomerSample,
            round: round,
            customer: customer,
          },
        }).then(({ body }) => {
          roundCustomer = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/round-customers+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/round-customers?page=0&size=20>; rel="last",<http://localhost/api/round-customers?page=0&size=20>; rel="first"',
              },
              body: [roundCustomer],
            }
          ).as('entitiesRequestInternal');
        });

        cy.visit(roundCustomerPageUrl);

        cy.wait('@entitiesRequestInternal');
      });
       */

      beforeEach(function () {
        cy.visit(roundCustomerPageUrl);

        cy.wait('@entitiesRequest').then(({ response }) => {
          if (response?.body.length === 0) {
            this.skip();
          }
        });
      });

      it('detail button click should load details RoundCustomer page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('roundCustomer');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', roundCustomerPageUrlPattern);
      });

      it('edit button click should load edit RoundCustomer page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('RoundCustomer');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', roundCustomerPageUrlPattern);
      });

      it('edit button click should load edit RoundCustomer page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('RoundCustomer');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', roundCustomerPageUrlPattern);
      });

      // Reason: cannot create a required entity with relationship with required relationships.
      it.skip('last delete button click should delete instance of RoundCustomer', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('roundCustomer').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', roundCustomerPageUrlPattern);

        roundCustomer = undefined;
      });
    });
  });

  describe('new RoundCustomer page', () => {
    beforeEach(() => {
      cy.visit(roundCustomerPageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('RoundCustomer');
    });

    // Reason: cannot create a required entity with relationship with required relationships.
    it.skip('should create an instance of RoundCustomer', () => {
      cy.get(`[data-cy="sequenceOrder"]`).type('25414');
      cy.get(`[data-cy="sequenceOrder"]`).should('have.value', '25414');

      cy.get(`[data-cy="visited"]`).should('not.be.checked');
      cy.get(`[data-cy="visited"]`).click();
      cy.get(`[data-cy="visited"]`).should('be.checked');

      cy.get(`[data-cy="visitTime"]`).type('2026-02-14T06:32');
      cy.get(`[data-cy="visitTime"]`).blur();
      cy.get(`[data-cy="visitTime"]`).should('have.value', '2026-02-14T06:32');

      cy.get(`[data-cy="notes"]`).type('../fake-data/blob/hipster.txt');
      cy.get(`[data-cy="notes"]`).invoke('val').should('match', new RegExp('../fake-data/blob/hipster.txt'));

      cy.get(`[data-cy="round"]`).select(1);
      cy.get(`[data-cy="customer"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        roundCustomer = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', roundCustomerPageUrlPattern);
    });
  });
});
