import express from 'express';

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

app.get('/api', (req, res) => {
  console.log('yoo');
  res.send(mockResponse);
});
app.get('/', (req, res) => {
  chirp('Hello World');
  res.send(mockResponse);
});
app.listen(port, function() {
  console.log(`App listening on port: ${port}`);
});
