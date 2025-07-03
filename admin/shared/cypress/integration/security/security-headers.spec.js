function getHeaders(url = '/', callback) {
  cy.request(url).then(response => {
    const { headers } = response;
    callback(headers);
  });
}

function checkIfHasHeader(headerName, headerValue, url = '/') {
  checkHeader(true, headerName, headerValue, url);
}

function checkIfHasNotHeader(headerName, headerValue, url = '/') {
  checkHeader(false, headerName, headerValue, url);
}

function checkHeader(exists, headerName, headerValue, url) {
  const propertyName = headerName.toLowerCase();
  getHeaders(url, headers => {
    const hasProperty = propertyName in headers;

    if (headerValue) {
      cy.expect(hasProperty).to.be.equal(true);
      cy.expect(headers[propertyName] === headerValue).to.be.equal(exists);
    } else {
      cy.expect(hasProperty).to.be.equal(exists);
    }
  });
}

describe('Security headers', () => {
  it('should send a Content-Security-Policy header', () => {
    checkIfHasHeader('Content-Security-Policy');
  });
  it('should send a X-Frame-Options header with "SAMEORIGIN" value', () => {
    checkIfHasHeader('X-Frame-Options', 'SAMEORIGIN');
  });
  it('should send a X-DNS-Prefetch-Control header with "off" value', () => {
    checkIfHasHeader('X-DNS-Prefetch-Control', 'off');
  });
  it('should send a Strict-Transport-Security header', () => {
    checkIfHasHeader('Strict-Transport-Security');
  });
  it('should send a X-Content-Type-Options header', () => {
    checkIfHasHeader('X-Content-Type-Options', 'nosniff');
  });
  it('should send a X-Download-Options header with "noopen" value', () => {
    checkIfHasHeader('X-Download-Options', 'noopen');
  });
  it('should send a X-Permitted-Cross-Domain-Policies header with "none" value', () => {
    checkIfHasHeader('X-Permitted-Cross-Domain-Policies', 'none');
  });
  it('should send a Referrer-Policy header with "same-origin" value', () => {
    checkIfHasHeader('Referrer-Policy', 'same-origin');
  });
  it('should send a X-XSS-Protection header with "0" value', () => {
    checkIfHasHeader('X-XSS-Protection');
  });
  it('should not send a X-Powered-By header', () => {
    checkIfHasNotHeader('X-Powered-By');
  });
});
