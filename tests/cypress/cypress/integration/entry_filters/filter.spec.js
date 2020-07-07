import Entries from '../../elements/pages/entries/Entries';
const entry = new Entries
const { _, $ } = Cypress
Cypress.config().baseUrl = 'localhost:8888';
context('Entry filtering', () => {

		beforeEach(function() {
			cy.visit('http://localhost:8888/admin.php?/cp/login');
			cy.get('#username').type('admin')
      		cy.get('#password').type('password')
      		cy.get('.button').click()
			cy.hasNoErrors()
		})

		it('Creates Channels to work with', () => {
			cy.visit('http://localhost:8888/admin.php?/cp/channels/create')
			cy.get("input[name = 'channel_title']").type('Blog')
		  	cy.get('button').contains('Save').eq(0).click()
		  	cy.get('p').contains('The channel Blog has been created')

		  	cy.visit('http://localhost:8888/admin.php?/cp/channels/create')
			cy.get("input[name = 'channel_title']").type('Contact')
		  	cy.get('button').contains('Save').eq(0).click()
		  	cy.get('p').contains('The channel Contact has been created')


		  	cy.visit('http://localhost:8888/admin.php?/cp/channels/create')
			cy.get("input[name = 'channel_title']").type('Discover')
		  	cy.get('button').contains('Save').eq(0).click()
		  	cy.get('p').contains('The channel Discover has been created')

	  	
		})

		it('Creates  Entries to work with', () => {
			cy.visit('http://localhost:8888/admin.php?/cp/publish/edit')
		  	cy.get('.main-nav__toolbar > .button').click()
		  	cy.get('a').contains('Blog').click()
		  	cy.get('input[name="title"]').type('Blog Entry')
		  	cy.get('button').contains('Save').eq(0).click()
		  	cy.get('p').contains('The entry Blog Entry has been created')

		  	cy.visit('http://localhost:8888/admin.php?/cp/publish/edit')
		  	cy.get('.main-nav__toolbar > .button').click()
		  	cy.get('a').contains('Contact').click()
		  	cy.get('input[name="title"]').type('Contact Entry')
		  	cy.get('button').contains('Save').eq(0).click()
		  	cy.get('p').contains('The entry Contact Entry has been created')


		  	cy.visit('http://localhost:8888/admin.php?/cp/publish/edit')
		  	cy.get('.main-nav__toolbar > .button').click()
		  	cy.get('a').contains('Discover').click()
		  	cy.get('input[name="title"]').type('Discover Entry')
		  	cy.get('button').contains('Save').eq(0).click()
		  	cy.get('p').contains('The entry Discover Entry has been created')
		})
		
		it('Closes the Blog entry to sort by later', () => {
			cy.visit('http://localhost:8888/admin.php?/cp/publish/edit')
			cy.get('a').contains('Blog Entry').eq(0).click()
			cy.get('button').contains('Options').click()
			cy.get('label[class= "select__button-label act"]').click()
			cy.get('span').contains('Closed').click()
			cy.get('button').contains('Save').eq(0).click()
			cy.get('p').contains('The entry Blog Entry has been updated')
		})

		it('Can sort entries by their channel also tests clear', () => {
			cy.visit('http://localhost:8888/admin.php?/cp/publish/edit')
			entry.get('Entries').find('tr').should('have.length',3)
			entry.get('ChannelSort').click()
			cy.get('.dropdown--open .dropdown__link:nth-child(1)').click();
			cy.wait(500)
			cy.get('h1').contains('Entries').click()
			entry.get('Entries').find('tr').should('have.length',1)
			cy.get('a').contains('Blog Entry').should('exist')

			cy.visit('http://localhost:8888/admin.php?/cp/publish/edit')
			entry.get('Entries').find('tr').should('have.length',3)
			entry.get('ChannelSort').click()
			cy.get('.dropdown--open .dropdown__link:nth-child(2)').click();
			cy.wait(500)
			cy.get('h1').contains('Entries').click()
			entry.get('Entries').find('tr').should('have.length',1)
			cy.get('a').contains('Contact Entry').should('exist')

			cy.visit('http://localhost:8888/admin.php?/cp/publish/edit')
			entry.get('Entries').find('tr').should('have.length',3)
			entry.get('ChannelSort').click()
			cy.get('.dropdown--open .dropdown__link:nth-child(3)').click();
			cy.wait(500)
			cy.get('h1').contains('Entries').click()
			entry.get('Entries').find('tr').should('have.length',1)
			cy.get('a').contains('Discover Entry').should('exist')
		})



		it('can sort by search bar (Searching in Titles)', () =>{
			cy.visit('http://localhost:8888/admin.php?/cp/publish/edit')
			entry.get('SearchBar').clear().type('Blog{enter}')
			entry.get('Entries').find('tr').should('have.length',1)

			entry.get('SearchBar').clear().type('Contact{enter}')
			entry.get('Entries').find('tr').should('have.length',1)

			entry.get('SearchBar').clear().type('Discover{enter}')
			entry.get('Entries').find('tr').should('have.length',1)
		})


		//These tests were for columns in a different branch that this branch does not have currently

		it('can change the columns', () => {
			cy.visit('http://localhost:8888/admin.php?/cp/publish/edit')
			cy.get('a').contains('Author').should('exist')
			entry.get('ColumnsSort').click()
			entry.get('Author').uncheck()
			cy.get('h1').contains('Entries').click() //need to click out of the columns menu to have the action occur
			cy.get('a').contains('Author').should('not.exist')
		})


		it('makes a default if all columns are turned off', () => {
			cy.visit('http://localhost:8888/admin.php?/cp/publish/edit')
			entry.get('ColumnsSort').click()

			entry.get('Author').uncheck({force:true})
			entry.get('Id').uncheck({force:true})
			entry.get('Date').uncheck({force:true})
			entry.get('Status').uncheck({force:true})
			entry.get('Url').uncheck({force:true})
			entry.get('Expire').uncheck({force:true})
			entry.get('Channel').uncheck({force:true})
			entry.get('Comments').uncheck({force:true})
			entry.get('Category').uncheck({force:true})
			entry.get('Title').uncheck({force:true})
			cy.get('h1').contains('Entries').click()
			entry.get('Entries').find('tr').should('have.length',3)

			cy.get('a').contains('ID#').should('exist')
			cy.get('a').contains('Title').should('exist')
			cy.get('a').contains('Date').should('exist')
			cy.get('a').contains('Author').should('exist')
			cy.get('a').contains('Status').should('exist')
		})

		it('Creates a second user to sort by their entries', () => {
			 cy.visit('http://localhost:8888/admin.php?/cp/members/create')
			cy.get('input[name="username"]').eq(0).type('user2')
			cy.get('input[name="email"]').eq(0).type('user2@test.com')
			cy.get('input[name="password"]').eq(0).type('password')
			cy.get('input[name="confirm_password"]').eq(0).type('password')
			cy.get('input[name="verify_password"]').eq(0).type('password')
			cy.get('button').contains('Roles').click()

			cy.get('input[type="radio"][name="role_id"][value="1"]').click()//make a super admin2
			cy.get('button').contains('Save').click()

			cy.get('img[alt="admin"]').click()
			cy.get('a').contains('Log Out').click()

			cy.visit('http://localhost:8888/admin.php?/cp/login');
			cy.get('#username').type('user2')
      		cy.get('#password').type('password')
      		cy.get('.button').click()

      		

		  	cy.visit('http://localhost:8888/admin.php?/cp/publish/edit')
		  	cy.get('.main-nav__toolbar > .button').click()
		  	cy.get('a').contains('Blog').click()
		  	cy.get('input[name="title"]').type('Another Entry in Blog')
		  	cy.get('button').contains('Save').eq(0).click()
		  	cy.get('p').contains('has been created')

		  	cy.visit('http://localhost:8888/admin.php?/cp/publish/edit')
		  	entry.get('Entries').find('tr').should('have.length',4)
		  	entry.get('AuthorSort').click()
		  	cy.get('a').contains('user2').click()
		  	cy.wait(800)
		  	entry.get('Entries').find('tr').should('have.length',1)

		  	entry.get('AuthorSort').click()
		  	cy.get('a').contains('admin').click()
		  	cy.wait(800)
		  	entry.get('Entries').find('tr').should('have.length',3)

		})

		it('Can combine all search fields', () =>{
			cy.visit('http://localhost:8888/admin.php?/cp/publish/edit')
			entry.get('AuthorSort').click()
			cy.get('a').contains('admin').click()
			cy.wait(800)
			entry.get('Entries').find('tr').should('have.length',3)

			entry.get('StatusSort').click()

			cy.get('.dropdown--open .dropdown__link:nth-child(1)').click(); //Open
			cy.wait(800)
			entry.get('Entries').find('tr').should('have.length',2)

			entry.get('ChannelSort').click()
			cy.get('.dropdown--open .dropdown__link:nth-child(1)').click();
			cy.wait(800)
			entry.get('Entries').find('tr').contains('No Entries found')

			entry.get('ChannelSort').click()
			cy.get('.dropdown--open .dropdown__link:nth-child(2)').click();
			cy.wait(800)
			entry.get('Entries').find('tr').should('have.length',1)
		})

		it('can Search in Content but not title',() => {
			//Real quick add in a text field to one of our channels
			cy.visit('http://localhost:8888/admin.php?/cp/fields')
			cy.get('a').contains('New Field').click()
			cy.get('input[name="field_label"]').type('Simple Text')
			cy.get('button').contains('Save').click()
			cy.get('p').contains('has been created')

			cy.visit('http://localhost:8888/admin.php?/cp/channels')
			cy.get('div').contains('Discover').click()
			cy.get('button').contains('Fields').click()
			cy.get('div').contains('Simple Text').click()
			cy.get('button').contains('Save').click()

			cy.visit('http://localhost:8888/admin.php?/cp/publish/edit')
			cy.get('a').contains('Discover Entry').click()
			cy.get('input[maxlength="256"]').type('The Quick Brown fox...')
			cy.get('button').contains('Save').click()

			cy.visit('http://localhost:8888/admin.php?/cp/publish/edit')
			
			
			entry.get('SearchIn').click()
			cy.get('[href="admin.php?/cp/publish/edit&search_in=content&perpage=25"]').click()
			cy.wait(900)
			entry.get('SearchBar').type('The Quick Brown{enter}')
			entry.get('Entries').find('tr').should('have.length',1)
			cy.get('a').contains('Discover Entry').should('exist')

			cy.visit('http://localhost:8888/admin.php?/cp/publish/edit')
			entry.get('SearchIn').click()
			cy.get('[href="admin.php?/cp/publish/edit&search_in=content&perpage=25"]').click()
			cy.wait(900)
			entry.get('SearchBar').type('Discover{enter}')
			cy.wait(900)
			entry.get('Entries').find('tr').contains('No Entries found')


		})

		it('search by content and title', () => {
			cy.visit('http://localhost:8888/admin.php?/cp/publish/edit')
			entry.get('SearchIn').click()
			cy.wait(900)
			cy.get('[href="admin.php?/cp/publish/edit&search_in=titles_and_content&perpage=25"]').click()
			cy.wait(900)
			entry.get('SearchBar').type('The Quick Brown{enter}')
			entry.get('Entries').find('tr').should('have.length',1)
			cy.get('a').contains('Discover Entry').should('exist')
			entry.get('SearchBar').clear()
			entry.get('SearchBar').type('Discover{enter}')
			entry.get('Entries').find('tr').should('have.length',1)
			cy.get('a').contains('Discover Entry').should('exist')

		})

		

		it('cleans for reruns', () => {
			cy.visit('http://localhost:8888/admin.php?/cp/publish/edit')
			
			entry.get('SelectAll').check({force:true})
			cy.wait(600) //needs a break after select all
			cy.get('select').select('Delete')
		
			cy.get('button[value="submit"]').click()
			cy.get('input[value="Confirm and Delete"]').click()

			cy.visit('http://localhost:8888/admin.php?/cp/channels')
			cy.get('.ctrl-all').click() //select all channels
			cy.get('select').select('Delete')
			cy.get('button[value="submit"]').click()
			cy.get('input[value="Confirm and Delete"]').click()

			cy.visit('http://localhost:8888/admin.php?/cp/members')
			cy.get('input[data-confirm="Member: <b>user2</b>"]').click()
			cy.get('select').select('Delete')
			cy.get('button[value="submit"]').click()
			cy.wait(800)
			cy.get('input[name="verify_password"]').type('password')
			cy.get('input[value="Confirm and Delete"]').click()

			cy.visit('http://localhost:8888/admin.php?/cp/fields')
			cy.get('.ctrl-all').click()
			cy.get('select').select('Delete')
			cy.get('button[value="submit"]').click()
			cy.wait(800)
			cy.get('input[value="Confirm and Delete"]').eq(1).click()

		})

})

