const express = require('express')
const morgan = require('morgan')
const app = express()
const cors = require('cors')


app.use (express.json())
app.use(express.static('dist'))
// app.use(morgan('tiny'))
morgan.token('post-body', (req,res) => {
    if (req.method === 'POST') {
        return JSON.stringify(req.body)
    }
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-body'))
app.use(cors())

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

const generateId = () => {
  const timestamp = Date.now() // Current time in milliseconds
  const random = Math.floor(Math.random() * 10000) // Random number 0-9999
  return `${timestamp}${random}`

}

app.get ('/api/persons', (request, response) => {
    response.json(persons)    
})

app.get('/api/info', (request, response) => {
    const currentTime = new Date().toString()
    const personsCount = persons.length 
    
    const infoHtml = `
        <div>
            <p>Phonebook has info for ${personsCount} people</p>
            <p>${currentTime}</p>
        </div>
    `
    response.send(infoHtml)
})

app.get ('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)

    if (person) 
        response.json(person)
    else
        response.status(404).end()
    
})

app.delete ('/api/persons/:id', (request, response) => {
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

app.post ('/api/persons', (request, response) => {
    const body = request.body
    if(!body) {
        return response.status(400).json({
            error: 'request body missing'
        })
    }

    if (!body.number || body.number.trim() === '') {
        return response.status(400).json({
            error: 'number missing'
        })
    }

    if (!body.name || body.name.trim() === '') {
        return response.status(400).json({
            error: 'name missing'
        })
    }

    const nameExists = persons.some(person => person.name.toLowerCase() === body.name.toLowerCase())

    if (nameExists) {
        return response.status(400).json({
            error: 'name must be unique'
        })
    }
    
    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
        
    }

    persons = persons.concat(person)
    response.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

