context('registration', () => {
  it('allows to start via the registration page', () => {
    cy.visit('/registration')
      .get('input#firstname')
      .type('Max')
      .get('input#lastname')
      .type('Mustermann')
      .get('input#email')
      .type('max@example.com')
      .get('select#category')
      .select('f')
      .get('input#birthyear')
      .type('2000')
      .get('select#visibility')
      .select('yes')
      .get('select#goal')
      .select('moderate')
      .get('input#shirt')
      .get('button#submit')
      .click()
      .get('div.thanks')
      .should('exist')
      .get('a#editurl')
      .should('exist')
      .get('span.amount')
      .should('have value', '20.00')
  });
});


