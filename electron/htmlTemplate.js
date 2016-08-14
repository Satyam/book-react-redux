export default (bundles, nodeModules) => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Sample Web Page</title>
    <link rel="stylesheet" href="file://${nodeModules}/bootstrap/dist/css/bootstrap.min.css" />
    <link rel="stylesheet" href="file://${nodeModules}/bootstrap/dist/css/bootstrap-theme.min.css" />
    <link rel="stylesheet" href="file://${bundles}/electronClient.css" />
  </head>
  <body>
    <div id="contents" class="container-fluid"></div>
    <script src="file://${bundles}/electronClient.js"></script>
  </body>
</html>
`;
