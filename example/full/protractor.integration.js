exports.config = {
    specs: ['src/Test/Integration/*.js'],
    capabilities: {
        browserName: 'chrome',
        chromeOptions: {
            args: [ "--headless" ]
        }
    },
    directConnect: true,
    baseUrl: 'http://localhost:3000',
    framework: 'jasmine',
    onPrepare: function() {
        browser.waitForAngularEnabled(false);
    }
};