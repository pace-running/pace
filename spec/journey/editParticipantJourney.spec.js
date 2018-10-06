context('participant edits themself', () => {
  it('shows an error when using invalid link', () => {
    cy.visit('/editparticipant/invalidSecureId',{failOnStatusCode: false})
      .get('h1')
      .should('contain','Teilnehmer nicht bekannt')
  });
  it('should edit a participant', () => {
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
});
