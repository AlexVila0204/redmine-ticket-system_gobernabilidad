const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const REDMINE_URL = 'http://localhost:3000';

const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Redmine-API-Key');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.url.startsWith('/api/')) {
        const redmineUrl = REDMINE_URL + req.url.replace('/api', '');
        
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const fetch = (await import('node-fetch')).default;
                
                const headers = {
                    'Content-Type': 'application/json'
                };
                
                if (req.headers['x-redmine-api-key']) {
                    headers['X-Redmine-API-Key'] = req.headers['x-redmine-api-key'];
                }

                const response = await fetch(redmineUrl, {
                    method: req.method,
                    headers: headers,
                    body: req.method !== 'GET' ? body : undefined
                });

                const data = await response.text();
                res.writeHead(response.status, { 'Content-Type': 'application/json' });
                res.end(data);
            } catch (error) {
                console.error('Error proxy:', error.message);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error de conexión con Redmine' }));
            }
        });
        return;
    }

    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = path.join(__dirname, filePath);

    const extname = path.extname(filePath);
    const contentTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml'
    };

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404);
                res.end('Archivo no encontrado');
            } else {
                res.writeHead(500);
                res.end('Error del servidor');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentTypes[extname] || 'text/plain' });
            res.end(content);
        }
    });
});

server.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('Servidor iniciado en: http://localhost:' + PORT);
    console.log('='.repeat(50));
    console.log('');
    console.log('Endpoints disponibles:');
    console.log('   - Frontend: http://localhost:' + PORT);
    console.log('   - API Proxy: http://localhost:' + PORT + '/api/...');
    console.log('');
    console.log('Conectando a Redmine en: ' + REDMINE_URL);
    console.log('');
    console.log('Presiona Ctrl+C para detener el servidor');
});

