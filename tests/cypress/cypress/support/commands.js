// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// require('@4tw/cypress-drag-drop')

// -- This is a parent command --
Cypress.Commands.add("login", (user) => {
    if (Cypress.$('input[name=username]:visible').length == 0) {
        return;
    }

    if (!user) {
        user = {
            email: Cypress.env("USER_EMAIL"),
            password: Cypress.env("USER_PASSWORD"),
        }
    }

    if (user.email) {
        cy.get('input[name=username]').clear().type(user.email)
    }

    if (user.password) {
        cy.get('input[name=password]').clear().type(user.password)
    }

    cy.get('input.btn').click()
})

Cypress.Commands.add("auth", (user) => {
    cy.visit('http://private60.ee/admin.php');
    cy.login(user);
})

Cypress.Commands.add("authVisit", (url, user) => {
    cy.visit('http://private60.ee/admin.php');
    cy.login(user);
    cy.visit(url);
})

Cypress.Commands.add("hasNoErrors", () => {
    // Search for "on line" or "Line Number:" since they're in pretty much in every PHP error
    if (cy.url().should('not.include', 'logs/developer')) {
        cy.contains('on line').should('not.exist')
    }

    cy.contains('Line Number:').should('not.exist')

    //cy.get('section').contains('Errors Found').should('not.exist')

    // Our custom PHP error handler
    cy.contains(', line').should('not.exist')

    cy.contains('Exception Caught').should('not.exist')
})

Cypress.Commands.add("dragTo", { prevSubject: true }, (subject, target) => {
    cy.wrap(subject).trigger("mousedown", { which: 1 })

    if (typeof target === 'string' || target instanceof String) {
        target = cy.get(target)
    } else {
        target = cy.wrap(target);
    }
    // console.log({ subject, target })
    target.trigger("mousemove", { force: true }).trigger("mouseup", { force: true })

    return target;
})

Cypress.Commands.add("installTheme", (theme, toUser = false) => {
    let themes = '../../themes/'
    let system = '../../system/'

    if (toUser) {
        cy.task('filesystem:copy', {
            from: `${system}ee/templates/_themes/${theme}`,
            to: `${themes}user/`
        })

        cy.task('filesystem:copy', {
            from: `${themes}ee/${theme}`,
            to: `${themes}user/`
        })
    } else {
        cy.task('filesystem:create', `${system}user/templates/_themes`)

        cy.task('filesystem:copy', {
            from: `${system}ee/templates/_themes/${theme}`,
            to: `${system}user/templates/_themes/`
        })

        cy.task('filesystem:copy', {
            from: `${themes}ee/${theme}`,
            to: `${themes}user/`
        })
    }
})

Cypress.Commands.add("uninstallTheme", (theme) => {
    let themes = '../../themes/'
    let system = '../../system/'

    cy.task('filesystem:delete', `${themes}user/${theme}`)
    cy.task('filesystem:delete', `${system}user/templates/_themes/${theme}`)
})

Cypress.Commands.add("eeConfig", ({ item, value, site_id }) => {
    if (!item) {
        return;
    }

    let command = [
        `cd support/fixtures && php config.php ${item}`,
        (value) ? ` ${value}` : '',
        (site_id) ? ` --site-id ${site_id}` : ''
    ].join('');

    cy.log(`Changing EE Config - ${command}`)

    cy.exec(command)
})

// Create a number of entries
//
// @param [Number] n = 10 Set a specific number of entries to create, defaults
//   to 10
// @return [void]
Cypress.Commands.add("createEntries", ({ n, channel }) => {

    if (!n) n = 10
    if (!channel) channel = 1

    let command = [
        `cd support/fixtures && php entries.php`,
        `--number ${n}`,
        `--channel ${channel}`
    ].join(' ')

    cy.exec(command)
})

Cypress.Commands.add("createChannel", ({ max_entries }) => {
    let command = `cd support/fixtures && php channels.php`;

    // include opts, change _ in hash symbols to - to standardize CLI behavior
    if (max_entries) {
        command += ` --max-entries ${max_entries}`
    }

    cy.exec(command).then((harvest) => {

        return harvest.stdout;
    })

})

// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })