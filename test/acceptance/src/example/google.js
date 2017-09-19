module.exports = {
  'Demo test Google' : function (browser) {
    browser
      .url('http://www.google.ie')
      .waitForElementVisible('body', 1000)
      .setValue('input[type=text]', 'vsware')
      .waitForElementVisible('input[name=btnK]', 1000);
      browser.pause(10000).end();
  }
};
