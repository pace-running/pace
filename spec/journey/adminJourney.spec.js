context('Not logged in', () => {
  it('should redirect to the login page', () => {
    cy.visit('/admin')
    cy.url().should('match', /login/)
  });
});

context('Logged in', () => {
  beforeEach( () => {
    cy.login();
  });

  it('should stay on admin page', () => {
    cy.url().should('match', /admin/)
  });

  it('should redirect to startpage on logout', () => {
    cy.visit('/logout')
    cy.location().should((loc) => {
      expect(loc.pathname).to.eq('/')
    })
  })

  it('should show registration statistics', () => {
    cy.get('canvas#registrationsCtx')
    .should('be.visible')
  });
  it('should show shirt order statistics', () => {
    cy.get('canvas#regularShirtsCtx')
    .should('be.visible');
    cy.get('canvas#slimShirtsCtx')
    .should('be.visible');
  });
  it('should show payment statistics', () => {
    cy.get('canvas#participantsCtx')
    .should('be.visible')
  });
});

context('Coupon codes', () => {
  it('should add couponcodes', () => {
    cy.task('resetDb');
    cy.login();
    cy.get('input[name="amountOnSite"]')
    .type('2')
    .get('button#generate-on-site-participants')
    .click()
    .get('span#currentNumOfOnSite')
    .should('contain', '2 blanco Registrierungen')
  });
})

context('Registration', () => {
  beforeEach( () => {
    cy.login();
    cy.task('resetDb');
  });
  it('should close and open registration', () => {
    cy.get('button#close-registration')
    .click()
    .get('p#registration-closed-message')
    .should('contain', 'Die Registrierung ist ab sofort geschlossen')
    .get('button#reopen-registration')
    .click()
    .url().should('match', /admin/)
  })
});

context('user management', () => {
  beforeEach( () => {
    cy.login();
    cy.task('resetDb');
  });
  it('should show userlist', () => {
    cy.task('validUser');
    cy.visit('admin/participants')
      .get('td.first-name')
      .get('td#amount')
      .should('contain','10')

  });
  it('should edit user', () => {
    cy.task('validUser');
    cy.visit('admin/participants')
    .get('a#edit.edit-button')
    .click()
    .get('input#firstname')
    .should('have.value', 'Friedrich')
    .get('input#lastname')
    .should('have.value', 'Schiller')
  })
  it('should delete user', () => {
    cy.task('validUser');
    cy.visit('/admin/participants')
      .get('button#delete-user')
      .click()
      .get('button#delete-user')
      .should('not.exist')
  })
  it('should confirm user', () => {
    cy.task('validUser');
    cy.visit('/admin/participants')
      .get('button#confirm-registration')
      .click()
      .get('#confirm-registration-done')
      .should('exist')
  })
});

context('startblock', () => {
  beforeEach( () => {
    cy.login();
    cy.task('resetDb');
  });
  it('should be able to define color,name and start time of a block', () => {
    cy.visit('admin/after')
    cy.get('input#color0')
      .type('#cafe00')
      .get('input#name0')
      .type('Startblock Rot')
      .get('input#hours0')
      .type('10')
      .get('input#minutes0')
      .type('15')
      .get('input#seconds0')
      .type('10')
      .get('button#set_race_starttime')
      .click()
      .get('input#name1')
      .should('have.value', 'Startblock Rot')
      .get('input#hours1')
      .should('have.value', '10')
  })
})
