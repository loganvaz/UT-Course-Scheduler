

let runDriver = () => {
    
    let {Builder} = require('selenium-webdriver');
    let chrome = require('selenium-webdriver/chrome');

    const service = new chrome.ServiceBuilder('/path/to/chromedriver');
    const driver = new Builder().forBrowser('chrome').setChromeService(service).build();

    //const webdriver = require('selenium-webdriver');
    //const chrome = require('selenium-webdriver/chrome');

    //let driver = new Builder().forBrowser('chrome').build();

    
    console.log("driver hit 2\n");
}