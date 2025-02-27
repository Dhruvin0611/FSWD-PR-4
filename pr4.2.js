const http = require('http');
const fs = require('fs');
const path = require('path');
const { parse } = require('url');

const usersFile = path.join(__dirname, 'users.json');

// Ensure users.json exists
if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, '[]');
}

// Read users from JSON file
const getUsers = () => JSON.parse(fs.readFileSync(usersFile, 'utf8'));

// Write users to JSON file
const saveUsers = (users) => fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

const server = http.createServer((req, res) => {
    const { pathname, query } = parse(req.url, true);
    
    if (req.method === 'GET' && pathname === '/users') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(getUsers()));
    } 
    
    else if (req.method === 'POST' && pathname === '/users') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const users = getUsers();
                const newUser = JSON.parse(body);
                newUser.id = Date.now().toString();
                users.push(newUser);
                saveUsers(users);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'User added', user: newUser }));
            } catch (error) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
    } 
    
    else if (req.method === 'DELETE' && pathname.startsWith('/users/')) {
        const userId = pathname.split('/')[2];
        let users = getUsers();
        const filteredUsers = users.filter(user => user.id !== userId);

        if (users.length === filteredUsers.length) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'User not found' }));
        } else {
            saveUsers(filteredUsers);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'User deleted' }));
        }
    } 
    
    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Route not found' }));
    }
});

server.listen(3000, () => console.log('Server running on port 3000'));