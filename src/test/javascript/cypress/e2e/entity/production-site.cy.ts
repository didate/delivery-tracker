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

describe('ProductionSite e2e test', () => {
  const productionSitePageUrl = '/production-site';
  const productionSitePageUrlPattern = new RegExp('/production-site(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const productionSiteSample = { code: 'clac', name: 'partout coin-coin parlementaire', active: false };

  let productionSite;
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
        code: 'tandis que équipe',
        name: 'jeune enfant broum turquoise',
        email: 'Florie.Marie64@hotmail.fr',
        phone: '0305146675',
        address: 'Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=',
        logoUrl: 'susciter désormais miaou',
        active: false,
      },
    }).then(({ body }) => {
      tenant = body;
    });
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/production-sites+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/production-sites').as('postEntityRequest');
    cy.intercept('DELETE', '/api/production-sites/*').as('deleteEntityRequest');
  });

  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/tenants', {
      statusCode: 200,
      body: [tenant],
    });
  });

  afterEach(() => {
    if (productionSite) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/production-sites/${productionSite.id}`,
      }).then(() => {
        productionSite = undefined;
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

  it('ProductionSites menu should load ProductionSites page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('production-site');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('ProductionSite').should('exist');
    cy.url().should('match', productionSitePageUrlPattern);
  });

  describe('ProductionSite page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(productionSitePageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create ProductionSite page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/production-site/new$'));
        cy.getEntityCreateUpdateHeading('ProductionSite');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', productionSitePageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/production-sites',
          body: {
            ...productionSiteSample,
            tenant,
          },
        }).then(({ body }) => {
          productionSite = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/production-sites+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/production-sites?page=0&size=20>; rel="last",<http://localhost/api/production-sites?page=0&size=20>; rel="first"',
              },
              body: [productionSite],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(productionSitePageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details ProductionSite page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('productionSite');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', productionSitePageUrlPattern);
      });

      it('edit button click should load edit ProductionSite page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('ProductionSite');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', productionSitePageUrlPattern);
      });

      it('edit button click should load edit ProductionSite page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('ProductionSite');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', productionSitePageUrlPattern);
      });

      it('last delete button click should delete instance of ProductionSite', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('productionSite').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', productionSitePageUrlPattern);

        productionSite = undefined;
      });
    });
  });

  describe('new ProductionSite page', () => {
    beforeEach(() => {
      cy.visit(productionSitePageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('ProductionSite');
    });

    it('should create an instance of ProductionSite', () => {
      cy.get(`[data-cy="code"]`).type('hormis jusque aux al');
      cy.get(`[data-cy="code"]`).should('have.value', 'hormis jusque aux al');

      cy.get(`[data-cy="name"]`).type('assez pendant que certes');
      cy.get(`[data-cy="name"]`).should('have.value', 'assez pendant que certes');

      cy.get(`[data-cy="address"]`).type('../fake-data/blob/hipster.txt');
      cy.get(`[data-cy="address"]`).invoke('val').should('match', new RegExp('../fake-data/blob/hipster.txt'));

      cy.get(`[data-cy="phone"]`).type('0533577543');
      cy.get(`[data-cy="phone"]`).should('have.value', '0533577543');

      cy.get(`[data-cy="active"]`).should('not.be.checked');
      cy.get(`[data-cy="active"]`).click();
      cy.get(`[data-cy="active"]`).should('be.checked');

      cy.get(`[data-cy="tenant"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        productionSite = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', productionSitePageUrlPattern);
    });
  });
});
