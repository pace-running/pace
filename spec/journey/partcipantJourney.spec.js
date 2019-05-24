/* global cy, context, it */
context('User registration', () => {
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
  it('show warning when registering without sending too much personal information', () => {
    cy.visit('/registration')
      .get('button#submit')
      .click()
      .get('body')
      .should('contain','keine Email-Adresse angegeben')
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

context('participant edits themselves', () => {
  it('shows an error when using invalid link', () => {
    cy.visit('/editparticipant/invalidSecureId',{failOnStatusCode: false})
      .get('h1')
      .should('contain','Teilnehmer nicht bekannt')
  });
  it('allows to edit data via the self-service-link', () => {
    cy.task('resetDb').then( () => {
      cy.task('validUser');
    });
    cy.visit('/editparticipant/secureIdForTheEditLink')
      .get('input#firstname')
      .should('have.value','Friedrich')
      .get('input#lastname')
      .should('have.value','Schiller')
      .get('p#startNumber')
      .should('exist')
  });
  it('allows to edit finish time via the self-service-link', () => {
    cy.task('resetDb').then( () => {
      cy.task('validUser');
    });
    cy.visit('/editparticipant/secureIdForTheEditLink')
      .get('input#hours')
      .should('have.value','')
      .type('00')
      .get('input#minutes')
      .should('have.value','')
      .type('50')
      .get('input#calc_seconds')
      .should('have.value','')
      .type('27')
      .get('input#agreement')
      .click()
      .get('#submit')
      .click();
    cy.visit('/editparticipant/secureIdForTheEditLink')
      .get('input#hours')
      .should('have.value','0')
      .get('input#minutes')
      .should('have.value','50')
      .get('input#calc_seconds')
      .should('have.value','27');
  });
});
