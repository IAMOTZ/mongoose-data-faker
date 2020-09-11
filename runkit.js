// This module can be a separate package on its own
const { ValueViewerSymbol } = require("@runkit/value-viewer")
const React = require('react');
const ReactDOMServer = require('react-dom/server');

const JSONPretty = require('react-json-pretty');
const JSONPrettyMon = require('react-json-pretty/dist/monikai');


const HTML = (data) => `` +
`
<!DOCTYPE html>
<html lang="en">
  <head>
    <style>
    </style>
  </head>
  <body>
    <div id="output">
      ${ReactDOMServer.renderToStaticMarkup(React.createElement(JSONPretty, { data, id:"json-pretty", theme: JSONPrettyMon }))}
    </div>
  </body>
</html>
`

module.exports.JSONView = (data) => ({
  [ValueViewerSymbol]: {
    title: 'mongoose-data-faker',
    HTML: HTML(data),
  }
});
