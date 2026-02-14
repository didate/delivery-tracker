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

describe('Expense e2e test', () => {
  const expensePageUrl = '/expense';
  const expensePageUrlPattern = new RegExp('/expense(\\?.*)?$');
  const username = Cypress.env('E2E_USERNAME') ?? 'user';
  const password = Cypress.env('E2E_PASSWORD') ?? 'user';
  // const expenseSample = {"expenseDate":"2026-02-14","amount":4694.97};

  let expense;
  // let tenant;
  // let expenseCategory;

  beforeEach(() => {
    cy.login(username, password);
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/tenants',
      body: {"code":"si","name":"commander touriste","email":"Eugene_Lambert57@hotmail.fr","phone":"+33 198121843","address":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=","logoUrl":"responsable si bien que tant que","active":true},
    }).then(({ body }) => {
      tenant = body;
    });
    // create an instance at the required relationship entity:
    cy.authenticatedRequest({
      method: 'POST',
      url: '/api/expense-categories',
      body: {"code":"après","name":"quitte à tant que","description":"Li4vZmFrZS1kYXRhL2Jsb2IvaGlwc3Rlci50eHQ=","active":true},
    }).then(({ body }) => {
      expenseCategory = body;
    });
  });
   */

  beforeEach(() => {
    cy.intercept('GET', '/api/expenses+(?*|)').as('entitiesRequest');
    cy.intercept('POST', '/api/expenses').as('postEntityRequest');
    cy.intercept('DELETE', '/api/expenses/*').as('deleteEntityRequest');
  });

  /* Disabled due to incompatibility
  beforeEach(() => {
    // Simulate relationships api for better performance and reproducibility.
    cy.intercept('GET', '/api/tenants', {
      statusCode: 200,
      body: [tenant],
    });

    cy.intercept('GET', '/api/expense-categories', {
      statusCode: 200,
      body: [expenseCategory],
    });

    cy.intercept('GET', '/api/drivers', {
      statusCode: 200,
      body: [],
    });

  });
   */

  afterEach(() => {
    if (expense) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/expenses/${expense.id}`,
      }).then(() => {
        expense = undefined;
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
    if (expenseCategory) {
      cy.authenticatedRequest({
        method: 'DELETE',
        url: `/api/expense-categories/${expenseCategory.id}`,
      }).then(() => {
        expenseCategory = undefined;
      });
    }
  });
   */

  it('Expenses menu should load Expenses page', () => {
    cy.visit('/');
    cy.clickOnEntityMenuItem('expense');
    cy.wait('@entitiesRequest').then(({ response }) => {
      if (response?.body.length === 0) {
        cy.get(entityTableSelector).should('not.exist');
      } else {
        cy.get(entityTableSelector).should('exist');
      }
    });
    cy.getEntityHeading('Expense').should('exist');
    cy.url().should('match', expensePageUrlPattern);
  });

  describe('Expense page', () => {
    describe('create button click', () => {
      beforeEach(() => {
        cy.visit(expensePageUrl);
        cy.wait('@entitiesRequest');
      });

      it('should load create Expense page', () => {
        cy.get(entityCreateButtonSelector).click();
        cy.url().should('match', new RegExp('/expense/new$'));
        cy.getEntityCreateUpdateHeading('Expense');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', expensePageUrlPattern);
      });
    });

    describe('with existing value', () => {
      /* Disabled due to incompatibility
      beforeEach(() => {
        cy.authenticatedRequest({
          method: 'POST',
          url: '/api/expenses',
          body: {
            ...expenseSample,
            tenant: tenant,
            category: expenseCategory,
          },
        }).then(({ body }) => {
          expense = body;

          cy.intercept(
            {
              method: 'GET',
              url: '/api/expenses+(?*|)',
              times: 1,
            },
            {
              statusCode: 200,
              headers: {
                link: '<http://localhost/api/expenses?page=0&size=20>; rel="last",<http://localhost/api/expenses?page=0&size=20>; rel="first"',
              },
              body: [expense],
            }
          ).as('entitiesRequestInternal');
        });

        cy.visit(expensePageUrl);

        cy.wait('@entitiesRequestInternal');
      });
       */

      beforeEach(function () {
        cy.visit(expensePageUrl);

        cy.wait('@entitiesRequest').then(({ response }) => {
          if (response?.body.length === 0) {
            this.skip();
          }
        });
      });

      it('detail button click should load details Expense page', () => {
        cy.get(entityDetailsButtonSelector).first().click();
        cy.getEntityDetailsHeading('expense');
        cy.get(entityDetailsBackButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', expensePageUrlPattern);
      });

      it('edit button click should load edit Expense page and go back', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Expense');
        cy.get(entityCreateSaveButtonSelector).should('exist');
        cy.get(entityCreateCancelButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', expensePageUrlPattern);
      });

      it('edit button click should load edit Expense page and save', () => {
        cy.get(entityEditButtonSelector).first().click();
        cy.getEntityCreateUpdateHeading('Expense');
        cy.get(entityCreateSaveButtonSelector).click();
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', expensePageUrlPattern);
      });

      // Reason: cannot create a required entity with relationship with required relationships.
      it.skip('last delete button click should delete instance of Expense', () => {
        cy.get(entityDeleteButtonSelector).last().click();
        cy.getEntityDeleteDialogHeading('expense').should('exist');
        cy.get(entityConfirmDeleteButtonSelector).click();
        cy.wait('@deleteEntityRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(204);
        });
        cy.wait('@entitiesRequest').then(({ response }) => {
          expect(response?.statusCode).to.equal(200);
        });
        cy.url().should('match', expensePageUrlPattern);

        expense = undefined;
      });
    });
  });

  describe('new Expense page', () => {
    beforeEach(() => {
      cy.visit(expensePageUrl);
      cy.get(entityCreateButtonSelector).click();
      cy.getEntityCreateUpdateHeading('Expense');
    });

    // Reason: cannot create a required entity with relationship with required relationships.
    it.skip('should create an instance of Expense', () => {
      cy.get(`[data-cy="expenseDate"]`).type('2026-02-14');
      cy.get(`[data-cy="expenseDate"]`).blur();
      cy.get(`[data-cy="expenseDate"]`).should('have.value', '2026-02-14');

      cy.get(`[data-cy="amount"]`).type('20923.84');
      cy.get(`[data-cy="amount"]`).should('have.value', '20923.84');

      cy.get(`[data-cy="description"]`).type('../fake-data/blob/hipster.txt');
      cy.get(`[data-cy="description"]`).invoke('val').should('match', new RegExp('../fake-data/blob/hipster.txt'));

      cy.get(`[data-cy="receiptUrl"]`).type('chut vide ici');
      cy.get(`[data-cy="receiptUrl"]`).should('have.value', 'chut vide ici');

      cy.get(`[data-cy="tenant"]`).select(1);
      cy.get(`[data-cy="category"]`).select(1);

      cy.get(entityCreateSaveButtonSelector).click();

      cy.wait('@postEntityRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(201);
        expense = response.body;
      });
      cy.wait('@entitiesRequest').then(({ response }) => {
        expect(response?.statusCode).to.equal(200);
      });
      cy.url().should('match', expensePageUrlPattern);
    });
  });
});
