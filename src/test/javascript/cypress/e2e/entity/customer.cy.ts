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

describe('Customer e2e test', () => {
  const customerPageUrl = '/customer';
  const customerPageUrlPattern = new RegExp('/customer(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const customerSample = { code: 'précipiter à défaut de', name: 'hystérique auparavant totalement', active: true };

  let customer;
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
        code: 'en faveur de badabou',
        name: 'autrefois sale',
        email: 'Aleaume_Denis76@yahoo.fr',
        phone: '0205079481',
        address: 'Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=',
        logoUrl: 'avant que totalement',
        active: false,
      },
    }).then(({ body }) => {
      tenant = body;
    });
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/customers+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/customers').as('postEntityRequest');
    cy.intercept('DELETE', '/api/customers/*').as('deleteEntityRequest');
  });

  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/tenants', {
      statusCode: 200,
      body: [tenant],
    });

    cy.intercept('GET', '/api/drivers', {
      statusCode: 200,
      body: [],
    });
  });

  afterEach(() => {
    if (customer) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/customers/${customer.id}`,
      }).then(() => {
        customer = undefined;
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

  it('Customers menu should load Customers page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('customer');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Customer').should('exist');
    cy.url().should('match', customerPageUrlPattern);
  });

  describe('Customer page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(customerPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Customer page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/customer/new$'));
        cy.getEntityCreateUpdateHeading('Customer');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', customerPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/customers',
          body: {
            ...customerSample,
            tenant,
          },
        }).then(({ body }) => {
          customer = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/customers+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/customers?page=0&size=20>; rel="last",<http://localhost/api/customers?page=0&size=20>; rel="first"',
              },
              body: [customer],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(customerPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details Customer page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('customer');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', customerPageUrlPattern);
      });

      it('edit button click should load edit Customer page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Customer');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', customerPageUrlPattern);
      });

      it('edit button click should load edit Customer page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Customer');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', customerPageUrlPattern);
      });

      it('last delete button click should delete instance of Customer', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('customer').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', customerPageUrlPattern);

        customer = undefined;
      });
    });
  });

  describe('new Customer page', () => {
    beforeEach(() => {
      cy.visit(customerPageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Customer');
    });

    it('should create an instance of Customer', () => {
      cy.get(`[data-cy="code"]`).type('snif');
      cy.get(`[data-cy="code"]`).should('have.value', 'snif');

      cy.get(`[data-cy="name"]`).type('parlementaire miam prestataire de services');
      cy.get(`[data-cy="name"]`).should('have.value', 'parlementaire miam prestataire de services');

      cy.get(`[data-cy="phone"]`).type('+33 491453114');
      cy.get(`[data-cy="phone"]`).should('have.value', '+33 491453114');

      cy.get(`[data-cy="email"]`).type('Oger98@gmail.com');
      cy.get(`[data-cy="email"]`).should('have.value', 'Oger98@gmail.com');

      cy.get(`[data-cy="address"]`).type('../fake-data/blob/hipster.txt');
      cy.get(`[data-cy="address"]`).invoke('val').should('match', new RegExp('../fake-data/blob/hipster.txt'));

      cy.get(`[data-cy="latitude"]`).type('5363.01');
      cy.get(`[data-cy="latitude"]`).should('have.value', '5363.01');

      cy.get(`[data-cy="longitude"]`).type('21894.75');
      cy.get(`[data-cy="longitude"]`).should('have.value', '21894.75');

      cy.get(`[data-cy="active"]`).should('not.be.checked');
      cy.get(`[data-cy="active"]`).click();
      cy.get(`[data-cy="active"]`).should('be.checked');

      cy.get(`[data-cy="notes"]`).type('../fake-data/blob/hipster.txt');
      cy.get(`[data-cy="notes"]`).invoke('val').should('match', new RegExp('../fake-data/blob/hipster.txt'));

      cy.get(`[data-cy="tenant"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        customer = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', customerPageUrlPattern);
    });
  });
});
