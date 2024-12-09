const http = require('http')
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))
app.use((request, response, next) => {
  request.requestTime = new Date();

  next();
});
const morgan = require('morgan')
morgan.token('body', (req) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

const Person = require('./models/person')
// morgan(function (tokens, req, res) {
//   return [
//     tokens.method(req, res),
//     tokens.url(req, res),
//     tokens.status(req, res),
//     tokens.res(req, res, 'content-length'), '-',
//     tokens['response-time'](req, res), 'ms'
//   ].join(' ')
// })
async function getAllPersons(next) {
  try {
    const result = await Person.find({})
    console.log('getAllPersons:', result)
    return result
  } catch (error) {
    console.error('Error in getAllPersons:', error)
    next(error)
  }
}

async function deletePersonById(rid, next) {

  const result = await Person.deleteOne({ _id: rid })
  console.log('deletePersonById:', result)
  if (result.deletedCount === 0) {
    const error = new Error('Person not found')
    error.name = 'NotFoundError'
    throw error
  }
  return result

}

async function getPersonById(id, next) {
  try {
    const result = await Person.find({ id: id })
    console.log('getPersonById:', result)
    if (!result || result.length === 0) {
      const error = new Error('Person not found')
      error.name = 'NotFoundError'
      throw error
    }
    return result
  } catch (error) {
    console.error('Error in getPersonById:', error)
    next(error)
  }
}

async function createPersons(persons) {
    const results = await Person.create(persons)
    console.log('Created documents:', results)
    return results
}

async function updatePersons(persons) {
  const bulkOps = persons.map(person => ({
    updateOne: {
      filter: { _id: person.rid },
      update: { $set: { number: person.number } }
    }
  }));
  const result = await Person.bulkWrite(bulkOps)
  console.log('Updated!!!', result)
  return result
}
// let persons = [
//   { 
//     "id": "1",
//     "name": "Arto Hellas", 
//     "number": "040-123456"
//   },
//   { 
//     "id": "2",
//     "name": "Ada Lovelace", 
//     "number": "39-44-5323523"
//   },
//   { 
//     "id": "3",
//     "name": "Dan Abramov", 
//     "number": "12-43-234345"
//   },
//   { 
//     "id": "4",
//     "name": "Mary Poppendieck", 
//     "number": "39-23-6423122"
//   }
// ]
// const app = http.createServer((request, response) => {
//   response.writeHead(200, { 'Content-Type': 'application/json' })
//   response.end(JSON.stringify(notes))
// })
// app.get('/', (request, response) => {
//   response.send('<h1>Hello World!</h1>')
// })
let persons = []

app.get('/api/persons', async (request, response, next) => {
  res = await getAllPersons()
  persons = res
  response.json(res)
})

app.get('/info', (request, response) => {
  const info = `<p> Phonebook has info for ${persons.length} people <br/>${request.requestTime}</p>`

  response.send(info)
})

app.get('/api/persons/:id', (request, response) => {
  console.log('get id');

  const id = request.params.id
  res = getPersonById(id)
  if (res) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})
app.delete('/api/persons/:rid', async (request, response, next) => {
  try {
    const rid = request.params.rid
    console.log("deleting-----", rid)
    await deletePersonById(rid, next)
    response.json({ rid: rid })
  } catch (error) {
    next(error)
  }
})


const generateId = (max) => {
  return Math.floor(Math.random() * max) + 1;
}

app.put('/api/persons/:id', async (request, response, next) => {
  try {

    console.log('----------------put-----------')
    const body = request.body
    console.log('update', body);
    const persons = await Person.find({ _id: body.rid })
    if (!body.name || persons.length == 0) {
      console.log('p', persons);

      // return response.status(400).json({
      //   error: 'name error'
      // })
      const error = new Error('Person not found')
      error.name = 'NotFoundError'
      throw error
    }
    const person = {
      ...body
    }
    console.log('update---------', person);

    res = await updatePersons([person])
    console.log('res------add', res);

    response.json(person)
  }
  catch (error) {
    next(error)
  }
})

app.post('/api/persons', async (request, response, next) => {
  try {
    const body = request.body

    console.log(body);

    if (!body.name || persons.find(p => p.name == body.name)) {
      return response.status(400).json({
        error: 'name error'
      })
    }
    const person = {
      name: body.name,
      number: body.number || '000',
      id: generateId(100),
    }

    res = await createPersons(person)
    console.log('res------add', res);

    response.json(res)
  }
  catch (error) {
    next(error)
  }

})

const errorHandler = (error, request, response, next) => {
  console.error('----errorHandler---', error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }
  if (error.name === 'NotFoundError') {
    return response.status(404).send({ error: 'Person not found' });
  }

  if (error.name === 'ValidationError') {
    return response.status(400).json({ msg: error.message });
  }
  return response.status(500).send({ error: 'An unexpected error occurred', msg:error.message });

}
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

const PORT = process.env.PORT
console.log('process.env.PORT', process.env.PORT);

app.listen(PORT)
console.log(`Server running on port ${PORT}`)