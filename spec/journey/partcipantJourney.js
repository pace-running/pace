context('User registration', () => {
  it('allows registration', () => {
    cy.visit('/registration')
      .get('input#firstname')
      .type('Hans')
      .get('input#lastname')
      .type('Irgendwas')
      .get('button#submit')
      .click()
      .get('h3')
      .should('contain','Hey Hans')
  })
    it('allows self service', () => {
    cy.visit('/registration')
      .get('input#firstname')
      .type('Hans')
      .get('input#lastname')
      .type('Irgendwas')
      .get('button#submit')
      .click()
      .get('a#editurl')
      .click()
      .get('input#firstname')
      .should('have.value','Hans')
  });
  it('shows participant in list', () => {
    cy.task('resetDb');
    cy.visit('/registration')
      .get('input#firstname')
      .type('Simone')
      .get('input#lastname')
      .type('Meyer')
      .get('button#submit')
      .click()
    cy.login();
    cy.visit('/admin/participants')
      .get('button#confirm-registration')
      .click()
      .visit('/logout')
    cy.visit('/participants')
      .get('body')
      .should('contain','Simone')

  })
  it('does not show participant in list if they do not want to', () => {
    cy.task('resetDb');
    cy.visit('/registration')
      .get('input#firstname')
      .type('Hans')
      .get('input#lastname')
      .type('Irgendwas')
      .get('select#visibility')
      .select('no')
      .get('button#submit')
      .click()
    cy.login();
    cy.visit('/admin/participants')
      .get('button#confirm-registration')
      .click()
      .visit('/logout')
    cy.visit('/participants')
      .get('body')
      .should('contain','Keine Daten in der Tabelle vorhanden')

  })
});


//it('shows registered participants only if they wished to be publicly visible', (done) => {

