describe('app login flow', function() {
    it('sets up initial variables', async function() {
        // Can be considered to be beforeAll, which Protractor lacks.
        browser.get('/');
        homeUrl = browser.getCurrentUrl();
        expect(browser.getTitle()).toEqual('Crypto Board');
        $('#signinMenuBtn').click();
        browser.wait(protractor.ExpectedConditions.presenceOf($('#loginLoginBtn')), 1000, 'Element taking too long to appear in the DOM');
        $('#loginLoginBtn').click();
        // expect(browser.getCurrentUrl()).toBe('/');
    });

    // it('registers a user and redirects to home', function() {
    //     browser.get('/register');
    //     name = 'user' + Math.floor(Math.random() * 100000);
    //     $('#email').sendKeys(name + '@test.com');
    //     $('#email2').sendKeys(name + '@test.com');
    //     $('#username').sendKeys(name);
    //     $('#firstName').sendKeys('Test');
    //     $('#lastName').sendKeys('User');
    //     $('#passwd1').sendKeys('Secret123');
    //     $('#passwd2').sendKeys('Secret123');
    //     $('button').click();
    //     expect(browser.getCurrentUrl()).toBe(homeUrl);
    // });

    // it('logs in correctly', function() {
    //     browser.get('/login');
    //     $('#username').sendKeys(name);
    //     $('#passwd').sendKeys('Secret123');
    //     $('button').click();
    //     expect(browser.getCurrentUrl()).toBe(homeUrl);
    // });
});