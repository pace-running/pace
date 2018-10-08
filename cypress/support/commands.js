
  Cypress.Commands.add("login", (username,password) => {
    cy.visit('/admin')
    .task('getConfig','admin.username').then( (username) => {
      return cy.get('input[name="username"]').type(username)
    })
    .task('getConfig','admin.password').then( (password) => {
      return cy.get('input[name="password"]').type(password)
    })
    .get('button[type="submit"]')
    .click()
  });
