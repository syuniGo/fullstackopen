const http = require('http')
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
app.use(cors())
app.use(express.json())
app.use(express.static('dist'))
app.use((request, response, next) => {
  request.requestTime = new Date();
  next();
});
// morgan(function (tokens, req, res) {
//   return [
//     tokens.method(req, res),
//     tokens.url(req, res),
//     tokens.status(req, res),
//     tokens.res(req, res, 'content-length'), '-',
//     tokens['response-time'](req, res), 'ms'
//   ].join(' ')
// })
morgan.token('body', (req) => {
  return JSON.stringify(req.body)
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
let persons = [
  { 
    "id": "1",
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": "2",
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": "3",
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": "4",
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
]
// const app = http.createServer((request, response) => {
//   response.writeHead(200, { 'Content-Type': 'application/json' })
//   response.end(JSON.stringify(notes))
// })
// app.get('/', (request, response) => {
//   response.send('<h1>Hello World!</h1>')
// })

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.get('/info', (request, response) => {
  // const time = request.requestTime.toLocaleString('en-GB', {
  //   weekday: 'short',
  //   year: 'numeric',
  //   month: 'short',
  //   day: '2-digit',
  //   hour: '2-digit',
  //   minute: '2-digit',
  //   second: '2-digit',
  //   timeZoneName: 'short'
  // });
  const info = `<p> Phonebook has info for ${persons.length} people <br/>${request.requestTime}</p>`

  response.send(info)
})

app.get('/api/persons/:id', (request, response) => {
  console.log('get id');
  
  const id = request.params.id
  const person = persons.find(person => person.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id
  persons = persons.filter(person => person.id != id)
  console.log('delete',persons);
  
  response.status(204).end()
})
const generateId = (max) => {
  return Math.floor(Math.random() * max) + 1;
}

app.post('/api/persons', (request, response) => {
  const body = request.body
  console.log(body);
  
  if (!body.name || persons.find(p => p.name ==body.name)) {
    return response.status(400).json({ 
      error: 'name error' 
    })
  }

  const person = {
    name: body.name,
    number: body.number || '000',
    id: generateId(100),
  }

  persons = persons.concat(person)

  response.json(persons)
})

const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)