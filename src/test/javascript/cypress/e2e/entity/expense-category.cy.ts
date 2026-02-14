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

describe('ExpenseCategory e2e test', () => {
  const expenseCategoryPageUrl = '/expense-category';
  const expenseCategoryPageUrlPattern = new RegExp('/expense-category(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  const expenseCategorySample = { code: 'smack', name: 'population du Québec broum aussitôt', active: true };

  let expenseCategory;
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
        code: 'oui volontiers',
        name: 'circuler',
        email: 'Odette_Francois@yahoo.fr',
        phone: '+33 746373661',
        address: 'Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=',
        logoUrl: 'circulaire',
        active: true,
      },
    }).then(({ body }) => {
      tenant = body;
    });
  });

  beforeEach(() => {
    cy.intercept('GET', '/api/expense-categories+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/expense-categories').as('postEntityRequest');
    cy.intercept('DELETE', '/api/expense-categories/*').as('deleteEntityRequest');
  });

  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/tenants', {
      statusCode: 200,
      body: [tenant],
    });
  });

  afterEach(() => {
    if (expenseCategory) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/expense-categories/${expenseCategory.id}`,
      }).then(() => {
        expenseCategory = undefined;
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

  it('ExpenseCategories menu should load ExpenseCategories page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('expense-category');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('ExpenseCategory').should('exist');
    cy.url().should('match', expenseCategoryPageUrlPattern);
  });

  describe('ExpenseCategory page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(expenseCategoryPageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create ExpenseCategory page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/expense-category/new$'));
        cy.getEntityCreateUpdateHeading('ExpenseCategory');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', expenseCategoryPageUrlPattern);
      });
    });

    describe('with existing value', () => {
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/expense-categories',
          body: {
            ...expenseCategorySample,
            tenant,
          },
        }).then(({ body }) => {
          expenseCategory = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/expense-categories+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/expense-categories?page=0&size=20>; rel="last",<http://localhost/api/expense-categories?page=0&size=20>; rel="first"',
              },
              body: [expenseCategory],
            },
          ).as('entitiesRequestInternal');
        });

        cy.visit(expenseCategoryPageUrl);

        cy.wait('@entitiesRequestInternal');
      });

      it('detail button click should load details ExpenseCategory page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('expenseCategory');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', expenseCategoryPageUrlPattern);
      });

      it('edit button click should load edit ExpenseCategory page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('ExpenseCategory');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', expenseCategoryPageUrlPattern);
      });

      it('edit button click should load edit ExpenseCategory page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('ExpenseCategory');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', expenseCategoryPageUrlPattern);
      });

      it('last delete button click should delete instance of ExpenseCategory', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('expenseCategory').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', expenseCategoryPageUrlPattern);

        expenseCategory = undefined;
      });
    });
  });

  describe('new ExpenseCategory page', () => {
    beforeEach(() => {
      cy.visit(expenseCategoryPageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('ExpenseCategory');
    });

    it('should create an instance of ExpenseCategory', () => {
      cy.get(`[data-cy="code"]`).type('porte-parole');
      cy.get(`[data-cy="code"]`).should('have.value', 'porte-parole');

      cy.get(`[data-cy="name"]`).type('lever gai plic');
      cy.get(`[data-cy="name"]`).should('have.value', 'lever gai plic');

      cy.get(`[data-cy="description"]`).type('../fake-data/blob/hipster.txt');
      cy.get(`[data-cy="description"]`).invoke('val').should('match', new RegExp('../fake-data/blob/hipster.txt'));

      cy.get(`[data-cy="active"]`).should('not.be.checked');
      cy.get(`[data-cy="active"]`).click();
      cy.get(`[data-cy="active"]`).should('be.checked');

      cy.get(`[data-cy="tenant"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        expenseCategory = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', expenseCategoryPageUrlPattern);
    });
  });
});
