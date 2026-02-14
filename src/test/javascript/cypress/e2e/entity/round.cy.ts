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

describe('Round e2e test', () => {
  const roundPageUrl = '/round';
  const roundPageUrlPattern = new RegExp('/round(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  // const roundSample = {"name":"fonctionnaire miaou aigre","roundDate":"2026-02-14","status":"PLANNED"};

  let round;
  // let tenant;
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
      body: {"code":"délectable autant po","name":"spécialiste jamais","email":"Vigile47@hotmail.fr","phone":"0296544542","address":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=","logoUrl":"de façon que","active":false},
    }).then(({ body }) => {
      tenant = body;
    });
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/drivers',
      body: {"code":"de par communauté ét","name":"plus","phone":"0466861715","email":"Lothaire.Petit@hotmail.fr","licenseNumber":"calme","active":true},
    }).then(({ body }) => {
      driver = body;
    });
  });
   */

  beforeEach(() => {
    cy.intercept('GET', '/api/rounds+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/rounds').as('postEntityRequest');
    cy.intercept('DELETE', '/api/rounds/*').as('deleteEntityRequest');
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/tenants', {
      statusCode: 200,
      body: [tenant],
    });

    cy.intercept('GET', '/api/drivers', {
      statusCode: 200,
      body: [driver],
    });

  });
   */

  afterEach(() => {
    if (round) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/rounds/${round.id}`,
      }).then(() => {
        round = undefined;
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

  it('Rounds menu should load Rounds page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('round');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Round').should('exist');
    cy.url().should('match', roundPageUrlPattern);
  });

  describe('Round page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(roundPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Round page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/round/new$'));
        cy.getEntityCreateUpdateHeading('Round');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', roundPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      /* Disabled due to incompatibility
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/rounds',
          body: {
            ...roundSample,
            tenant: tenant,
            driver: driver,
          },
        }).then(({ body }) => {
          round = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/rounds+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/rounds?page=0&size=20>; rel="last",<http://localhost/api/rounds?page=0&size=20>; rel="first"',
              },
              body: [round],
            }
          ).as('entitiesRequestInternal');
        });

        cy.visit(roundPageUrl);

        cy.wait('@entitiesRequestInternal');
      });
       */

      beforeEach(function () {
        cy.visit(roundPageUrl);

        cy.wait('@entitiesRequest').then(({ response }) => {
          if (response?.body.length === 0) {
            this.skip();
          }
        });
      });

      it('detail button click should load details Round page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('round');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', roundPageUrlPattern);
      });

      it('edit button click should load edit Round page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Round');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', roundPageUrlPattern);
      });

      it('edit button click should load edit Round page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Round');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', roundPageUrlPattern);
      });

      // Reason: cannot create a required entity with relationship with required relationships.
      it.skip('last delete button click should delete instance of Round', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('round').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', roundPageUrlPattern);

        round = undefined;
      });
    });
  });

  describe('new Round page', () => {
    beforeEach(() => {
      cy.visit(roundPageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Round');
    });

    // Reason: cannot create a required entity with relationship with required relationships.
    it.skip('should create an instance of Round', () => {
      cy.get(`[data-cy="name"]`).type('approximativement nonobstant équipe');
      cy.get(`[data-cy="name"]`).should('have.value', 'approximativement nonobstant équipe');

      cy.get(`[data-cy="roundDate"]`).type('2026-02-14');
      cy.get(`[data-cy="roundDate"]`).blur();
      cy.get(`[data-cy="roundDate"]`).should('have.value', '2026-02-14');

      cy.get(`[data-cy="status"]`).select('IN_PROGRESS');

      cy.get(`[data-cy="startTime"]`).type('2026-02-14T12:41');
      cy.get(`[data-cy="startTime"]`).blur();
      cy.get(`[data-cy="startTime"]`).should('have.value', '2026-02-14T12:41');

      cy.get(`[data-cy="endTime"]`).type('2026-02-14T15:16');
      cy.get(`[data-cy="endTime"]`).blur();
      cy.get(`[data-cy="endTime"]`).should('have.value', '2026-02-14T15:16');

      cy.get(`[data-cy="notes"]`).type('../fake-data/blob/hipster.txt');
      cy.get(`[data-cy="notes"]`).invoke('val').should('match', new RegExp('../fake-data/blob/hipster.txt'));

      cy.get(`[data-cy="tenant"]`).select(1);
      cy.get(`[data-cy="driver"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        round = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', roundPageUrlPattern);
    });
  });
});
