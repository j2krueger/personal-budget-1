const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res, next) => {
    res.status(200).send('Hello World! <a href="/stop">Click here to stop!</a>');
});

app.get('/stop', (req, res, next) => {
    res.status(200).send('Stopping Server!');
    console.log('Stopping server!');
    server.close();
})

const server = app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});