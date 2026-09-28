const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5500;
const ROOT = path.join(__dirname, 'docs');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.png':  'image/png',
};

const server = http.createServer((req, res) => {
  const filePath = req.url === '/'
    ? path.join(ROOT, 'index.html')
    : path.join(ROOT, req.url);

  const ext = path.extname(filePath);
  const contentType = MIME[ext] || 'text/plain';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('404: ' + filePath);
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('Rodando em http://127.0.0.1:5500');
});