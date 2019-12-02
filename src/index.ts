import express from 'express';
import chubs from './chubs';
console.log(process.env.DEBUG, '<< process.env.DEBUG');
const app = express();
const port = process.env.PORT || 8000;
const mockResponse = {
  foo: 'bar',
  bar: 'foo',
};

const chirp = (note: string): void => {
  console.log(note);
};

chubs();

app.get('/api', (req, res) => {
  res.send(mockResponse);
});
app.get('/', (req, res) => {
  chirp('Hello World');
  res.send(mockResponse);
});
app.listen(port, function() {
  console.log(`App listening on port: ${port}`);
});
