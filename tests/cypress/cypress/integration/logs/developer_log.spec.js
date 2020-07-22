import DeveloperLog from '../../elements/pages/logs/developer';
const page = new DeveloperLog
const { _, $ } = Cypress


context('Developer Log', () => {

	beforeEach(function() {
		cy.authVisit(page.urlMatcher);
		page.get('heading').contains('Developer Logs')
		cy.get('.filter-search-form > input').should('exist')
		cy.get(':nth-child(1) > .has-sub').contains('date')
		page.get('perpage_filter').should('exist')
		cy.get(':nth-child(3) > .has-sub').contains('show')
	})

	it('shows the Developer Logs page', () => {
		//page.runner()
		page.get('remove_all').should('exist')
		page.get('pagination').should('exist')
		page.get('perpage_filter').contains('show (25)')
		page.get('pages').should('have.length',6)
		page.get('items').should('have.length',25)
	
	})

	it('searches by phrases', () => {

		page.count = 1;
		page.timestamp_max =0;
		page.description = "Rspec entry for search";
		//page.runner()
		cy.get('.filter-search-form > input').type("Rspec{enter}")
		page.get('wrap').contains("we found 1 result")
		page.get('items').should('have.length',1)
	
	})

	it('searches localized deprecation strings', () => {
		cy.get('.filter-search-form > input').type("called in{enter}")
		page.get('items').should('exist')
		page.get('items').contains('called in')
	})

	it('shows no results on a failed search', () => {
		cy.get('.filter-search-form > input').type("NotFoundHere{enter}")
		cy.get('h1 > i').contains('we found 0 result')
		page.get('username_filter').should('exist')
		page.get('date_filter').should('exist')
		page.get('perpage_filter').should('exist')

       page.get('no_results').should('exist')

      page.get('pagination').should('not.exist')
      page.get('remove_all').should('not.exist')
	
	})


	it('filters by date', () => {
		page.count = 19;
		page.timestamp_max = 22
		//page.runner()
		page.count = 42;
		page.timestamp_min = 36;
		page.timestamp_max = 60;

		page.get('items').should('have.length',25)

		page.get('date_filter').click()
		cy.get('a').contains('Last 24 Hours').click()
		cy.get('div[class="item"]').should('have.length',23)//19
	})


	it('can change page size', () => {
		page.get('perpage_filter').click()
		cy.get('a').contains('25 results').click()
		page.get('perpage_filter').contains('show (25)')
		cy.get('div[class="item"]').should('have.length',25)
		page.get('pagination').should('exist')
		cy.get('.paginate > ul > :nth-child(1) > a').contains('First')
       cy.get('ul > :nth-child(2) > .act').contains('1')
       cy.get('.paginate > ul > :nth-child(3) > a').contains('2')
       cy.get('.paginate > ul > :nth-child(4) > a').contains('3')
       cy.get('.paginate > ul > :nth-child(5) > a').contains('Next')
       cy.get(':nth-child(6) > .last').contains('Last')
	})

	it('can set a custom limit', () => {
		page.get('perpage_filter').click()
		cy.get(':nth-child(3) > .sub-menu > .filter-search > input').type('42{enter}')
		page.get('perpage_filter').contains('show (42)') 
       cy.get('.paginate > ul > :nth-child(1) > a').contains('First')
       cy.get('a').contains('1').should('exist')
       cy.get('a').contains('2').should('exist')
       cy.get('a').contains('3').should('exist')
       cy.get('a').contains('Next').should('exist')
       cy.get('a').contains('Last').should('exist')
       cy.get('div[class="item"]').should('have.length',42)
	
	})

	it('can combine date and page size filters', () => {
		page.get('perpage_filter').click()
		cy.get('a').contains('25 results').click()
		page.get('perpage_filter').contains('show (25)')
		page.get('pagination').should('exist')
		page.get('date_filter').click()
		cy.get('a').contains('Last 24 Hours').click()
		cy.get('div[class="item"]').should('have.length',23)
	})

	

	it('shows the Prev button when on page 2', () => {
		cy.get('a').contains('Next').click()
    	cy.get('a').contains('Previous').should('exist')
	})

	it('does not show Next on the last page', () => {
		cy.get(':nth-child(6) > .last').click()
		cy.get('a').contains('Next').should('not.exist')
	})

	it('does not lose a filter value when paginating', () => {
		page.get('perpage_filter').click()
	
      cy.get('a').contains('25 results').click() // select 25
      page.get('perpage_filter').contains('show (25)') 
       cy.get(':nth-child(6) > .last')//checks that there are 6 pages
       cy.get('.paginate > ul > :nth-child(1) > a').contains('First')
       cy.get('div[class="item"]').should('have.length',25) 
       cy.get('a').contains('Next').should('exist')
       cy.get('a').contains('Next').click()
       cy.get('div[class="item"]').should('have.length',25) 
       cy.get('a').contains('1').should('exist')
       cy.get('a').contains('2').should('exist')
        cy.get('a').contains('3').should('exist')
       cy.get('a').contains('First').should('exist')
       cy.get('a').contains('Next').should('exist')
       cy.get('a').contains('Previous').should('exist')
       cy.get('a').contains('Last').should('exist')
	})

	 it('will paginate phrase search results', () => {
		page.count = 35;
		page.description = "Hidden entry";
		//page.runner()
		page.count = 35;
		page.description = "Visible entry";
		//page.runner()

		page.get('perpage_filter').click()
		cy.get('a').contains('25 results').click()
		page.get('perpage_filter').contains('show (25)')
		cy.get('.filter-search-form > input').type("Visible{enter}")
		cy.get('div[class="item"]').should('have.length',25) // check that we have 25 items
         cy.get('div[class="item"]').find('a').contains('Hidden').should('not.exist') //no item has admin
         cy.get('a').contains('1').should('exist')
         cy.get('a').contains('2').should('exist')
         cy.get('a').contains('First').should('exist')
         cy.get('a').contains('Next').should('exist')

         cy.get('a').contains('Last').should('exist')

         cy.get('a').contains('Next').click()
         //PG2

          cy.get('h1 > i').contains('we found 35 results')
          page.get('perpage_filter').contains('show (25)') 
     
    	 cy.get('div[class="item"]').should('have.length',10) // check that we have 10 items
         cy.get('div[class="item"]').find('a').contains('admin').should('not.exist') //no item has admin
         cy.get('a').contains('1').should('exist')
         cy.get('a').contains('2').should('exist')
         cy.get('a').contains('Previous').should('exist')
         cy.get('a').contains('First').should('exist')

         cy.get('a').contains('Last').should('exist')

	 })



	 it('can remove a single entry', () => {

	 	page.description = "Rspec entry to be deleted";
	 	page.count = 1;
	 	page.timestamp_max = 0;
	 	//page.runner()
	 	cy.get('.filter-search-form > input').type("Rspec entry to be deleted{enter}")
	 	cy.get('.remove > .m-link').click()
	 	cy.get('.modal-confirm-418 > .modal > .col-group > .col > .form-standard > form > :nth-child(6) > .btn').click()
	 	cy.get('.app-notice__content > :nth-child(2)').contains('1 log(s) deleted')
	
	 })

	it('can remove all entries', () => {
		page.get('remove_all').should('exist')
		page.get('remove_all').click()
		cy.get('.modal-confirm-all > .modal > .col-group > .col > .form-standard > form > :nth-child(6) > .btn').click()	
		cy.get('.app-notice__content > :nth-child(2)').contains('log(s) deleted')	
		page.get('no_results').should('exist')
	})

	it.only('can combine phrase search with filters', () => {
		page.count = 18;
		page.timestamp_max = 22;
		//page.runner()
		page.count = 5;
		page.timestamp_max = 22;
		page.description = "Rspec entry for search";
		//page.runner()
		page.count = 42;
		page.timestamp_min = 36;
		page.timestamp_max = 60;
		//page.runner()
		page.count = 10;
		page.timestamp_min = 36;
		page.timestamp_max = 60;
		page.description = "Rspec entry for search";
		//page.runner()

		page.get('date_filter').click()
		cy.get('a').contains('Last 24 Hours').click()
		cy.get('.filter-search-form > input').type("Rspec{enter}")
		cy.get('div[class="item"]').should('have.length',5) 
		page.get('pagination').should('not.exist')

	})
})