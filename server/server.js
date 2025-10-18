import express from 'express';
import app from './src/app.js';
import 'dotenv/config';

const port = process.env.PORT || 80;


app.use(express.static('../client/dist'));
app.use(express.static('dist'));


app.listen(port, () => {
  console.log(`Spinner listening on port ${port}`);
});