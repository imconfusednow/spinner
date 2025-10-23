import express from 'express';
import app from './src/app.js';
import 'dotenv/config';

const port = process.env.PORT;


app.listen(port, () => {
  console.log(`Spinner listening on port ${port}`);
});