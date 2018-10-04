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
      .click()
      .get('select')
      .get('button#submit')
      .click()
      .get('div.thanks')
      .should('exist')
      .get('a#editurl')
      .should('exist')
      .get('span.amount')
      .should('contain', '20.00')
  });

  it('doesnt display bank details and payment message when a valid coupon code is used', () => {
    cy.task('couponcode')
      .then((coupon) => {
        cy.visit('/registration')
          .get('input#firstname')
          .type('Vorname')
          .get('input#email')
          .type('something@example.com')
          .get('select#discount')
          .select('free')
          .get('input#couponcode')
          .type(coupon.code)
          .get('button#submit')
          .click()
          .get('span.amount')
          .should('not.exist')
      })
  });
  it('should return failure page on wrong couponcode', () => {
    cy.visit('registration')
      .get('input#firstname')
      .type('Vorname')
      .get('input#email')
      .type('something@example.com')
      .get('select#discount')
      .select('free')
      .get('input#couponcode')
      .type('invalid')
      .get('button#submit')
      .click()
      .get('p#failure-message')
      .should('exist')
  });

  it('shows a message when the registration is closed', () => {
    cy.task('registration', 'close')
      .then( () => {
        cy.visit('/registration')
          .get('h4.black')
          .should('contain','geschlossen')
          .task('registration','reopen')
          .then( () => {
            cy.visit('/registration')
              .get('input#firstname')
              .should('exist')
          })

      })
  })
});


