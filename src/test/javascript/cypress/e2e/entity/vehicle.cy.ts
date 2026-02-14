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

describe('Vehicle e2e test', () => {
  const vehiclePageUrl = '/vehicle';
  const vehiclePageUrlPattern = new RegExp('/vehicle(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const vehicleSample = { code: 'efficace creuser', name: 'ensuite payer au cas où', type: 'MOTO', active: false };

  let vehicle;
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
        code: 'envers',
        name: 'vu que',
        email: 'Megane95@hotmail.fr',
        phone: '0371125053',
        address: 'Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=',
        logoUrl: 'broum du moment que hebdomadaire',
        active: true,
      },
    }).then(({ body }) => {
      tenant = body;
    });
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/vehicles+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/vehicles').as('postEntityRequest');
    cy.intercept('DELETE', '/api/vehicles/*').as('deleteEntityRequest');
  });

  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/tenants', {
      statusCode: 200,
      body: [tenant],
    });
  });

  afterEach(() => {
    if (vehicle) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/vehicles/${vehicle.id}`,
      }).then(() => {
        vehicle = undefined;
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

  it('Vehicles menu should load Vehicles page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('vehicle');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Vehicle').should('exist');
    cy.url().should('match', vehiclePageUrlPattern);
  });

  describe('Vehicle page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(vehiclePageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Vehicle page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/vehicle/new$'));
        cy.getEntityCreateUpdateHeading('Vehicle');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', vehiclePageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/vehicles',
          body: {
            ...vehicleSample,
            tenant,
          },
        }).then(({ body }) => {
          vehicle = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/vehicles+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/vehicles?page=0&size=20>; rel="last",<http://localhost/api/vehicles?page=0&size=20>; rel="first"',
              },
              body: [vehicle],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(vehiclePageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details Vehicle page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('vehicle');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', vehiclePageUrlPattern);
      });

      it('edit button click should load edit Vehicle page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Vehicle');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', vehiclePageUrlPattern);
      });

      it('edit button click should load edit Vehicle page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Vehicle');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', vehiclePageUrlPattern);
      });

      it('last delete button click should delete instance of Vehicle', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('vehicle').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', vehiclePageUrlPattern);

        vehicle = undefined;
      });
    });
  });

  describe('new Vehicle page', () => {
    beforeEach(() => {
      cy.visit(vehiclePageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Vehicle');
    });

    it('should create an instance of Vehicle', () => {
      cy.get(`[data-cy="code"]`).type('si');
      cy.get(`[data-cy="code"]`).should('have.value', 'si');

      cy.get(`[data-cy="name"]`).type('vu que gâcher bang');
      cy.get(`[data-cy="name"]`).should('have.value', 'vu que gâcher bang');

      cy.get(`[data-cy="type"]`).select('CAR');

      cy.get(`[data-cy="brand"]`).type('ronron pour que miaou');
      cy.get(`[data-cy="brand"]`).should('have.value', 'ronron pour que miaou');

      cy.get(`[data-cy="model"]`).type('marquer');
      cy.get(`[data-cy="model"]`).should('have.value', 'marquer');

      cy.get(`[data-cy="registrationNumber"]`).type('multiple que');
      cy.get(`[data-cy="registrationNumber"]`).should('have.value', 'multiple que');

      cy.get(`[data-cy="year"]`).type('25024');
      cy.get(`[data-cy="year"]`).should('have.value', '25024');

      cy.get(`[data-cy="capacity"]`).type('27750.81');
      cy.get(`[data-cy="capacity"]`).should('have.value', '27750.81');

      cy.get(`[data-cy="fuelType"]`).type('énergique assez');
      cy.get(`[data-cy="fuelType"]`).should('have.value', 'énergique assez');

      cy.get(`[data-cy="active"]`).should('not.be.checked');
      cy.get(`[data-cy="active"]`).click();
      cy.get(`[data-cy="active"]`).should('be.checked');

      cy.get(`[data-cy="notes"]`).type('../fake-data/blob/hipster.txt');
      cy.get(`[data-cy="notes"]`).invoke('val').should('match', new RegExp('../fake-data/blob/hipster.txt'));

      cy.get(`[data-cy="tenant"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        vehicle = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', vehiclePageUrlPattern);
    });
  });
});
