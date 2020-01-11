const functions = require('firebase-functions');
const https = require('https');

// configured in https://app.intercom.io/a/apps/sb5qwtf5/articles/site/settings
const CUSTOM_HOST = 'resources.njcareers.org';

// Uses native https package with streams to keep things quick and light.
exports.resourcesProxy = functions.https.onRequest((req, res) => {
  const options = {
    headers: Object.assign({}, req.headers, { host: CUSTOM_HOST /* SNI */ }),
    host: 'custom.intercom.help',
    path: req.url,
    rejectUnauthorized: false, // effectively equivalent to using Cloudflare in "full" security mode
  };

  // these make it work in dev
  delete options.headers['x-forwarded-host'];
  delete options.headers['x-original-url'];

  const proxy = https.get(options, result => {
    res.writeHead(result.statusCode, result.statusMessage, result.headers);
    result.pipe(res, {
      end: true,
    });
  });

  req.pipe(proxy, {
    end: true,
  });
});
