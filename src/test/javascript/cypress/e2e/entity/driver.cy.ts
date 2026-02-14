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

describe('Driver e2e test', () => {
  const driverPageUrl = '/driver';
  const driverPageUrlPattern = new RegExp('/driver(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const driverSample = { code: 'informer', name: 'ici', active: false };

  let driver;
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
        code: 'au cas où vide',
        name: 'si tant',
        email: 'Francine.Lacroix48@hotmail.fr',
        phone: '+33 452511157',
        address: 'Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=',
        logoUrl: 'tchou tchouu tant que',
        active: true,
      },
    }).then(({ body }) => {
      tenant = body;
    });
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/drivers+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/drivers').as('postEntityRequest');
    cy.intercept('DELETE', '/api/drivers/*').as('deleteEntityRequest');
  });

  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/tenants', {
      statusCode: 200,
      body: [tenant],
    });

    cy.intercept('GET', '/api/vehicles', {
      statusCode: 200,
      body: [],
    });
  });

  afterEach(() => {
    if (driver) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/drivers/${driver.id}`,
      }).then(() => {
        driver = undefined;
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

  it('Drivers menu should load Drivers page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('driver');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Driver').should('exist');
    cy.url().should('match', driverPageUrlPattern);
  });

  describe('Driver page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(driverPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Driver page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/driver/new$'));
        cy.getEntityCreateUpdateHeading('Driver');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', driverPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/drivers',
          body: {
            ...driverSample,
            tenant,
          },
        }).then(({ body }) => {
          driver = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/drivers+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/drivers?page=0&size=20>; rel="last",<http://localhost/api/drivers?page=0&size=20>; rel="first"',
              },
              body: [driver],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(driverPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details Driver page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('driver');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', driverPageUrlPattern);
      });

      it('edit button click should load edit Driver page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Driver');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', driverPageUrlPattern);
      });

      it('edit button click should load edit Driver page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Driver');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', driverPageUrlPattern);
      });

      it('last delete button click should delete instance of Driver', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('driver').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', driverPageUrlPattern);

        driver = undefined;
      });
    });
  });

  describe('new Driver page', () => {
    beforeEach(() => {
      cy.visit(driverPageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Driver');
    });

    it('should create an instance of Driver', () => {
      cy.get(`[data-cy="code"]`).type('police');
      cy.get(`[data-cy="code"]`).should('have.value', 'police');

      cy.get(`[data-cy="name"]`).type('tsoin-tsoin affable');
      cy.get(`[data-cy="name"]`).should('have.value', 'tsoin-tsoin affable');

      cy.get(`[data-cy="phone"]`).type('0585635755');
      cy.get(`[data-cy="phone"]`).should('have.value', '0585635755');

      cy.get(`[data-cy="email"]`).type('Gaspard.Paul34@hotmail.fr');
      cy.get(`[data-cy="email"]`).should('have.value', 'Gaspard.Paul34@hotmail.fr');

      cy.get(`[data-cy="licenseNumber"]`).type('tellement atchoum');
      cy.get(`[data-cy="licenseNumber"]`).should('have.value', 'tellement atchoum');

      cy.get(`[data-cy="active"]`).should('not.be.checked');
      cy.get(`[data-cy="active"]`).click();
      cy.get(`[data-cy="active"]`).should('be.checked');

      cy.get(`[data-cy="tenant"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        driver = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', driverPageUrlPattern);
    });
  });
});
