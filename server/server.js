import app from './src/app.js';

const port = 80;

app.listen(port, () => {
    console.log(`Spinner listening on port ${port}`);
});
