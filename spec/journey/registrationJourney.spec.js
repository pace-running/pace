context('registration', () => {

  it('closes and open registration', () => {
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


