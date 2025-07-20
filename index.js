require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()

app.use (express.json())
app.use(express.static('dist'))
morgan.token('post-body', (req,res) => {
    if (req.method === 'POST') {
        return JSON.stringify(req.body)
    }
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-body'))

app.get ('/api/persons', (request, response) => {
    Person.find({})
        .then(persons => {
            response.json(persons)
        }
        )    
})

// app.get('/api/info', (request, response) => {
//     const currentTime = new Date().toString()
//     const personsCount = persons.length 
    
//     const infoHtml = `
//         <div>
//             <p>Phonebook has info for ${personsCount} people</p>
//             <p>${currentTime}</p>
//         </div>
//     `
//     response.send(infoHtml)
// })

app.get ('/api/persons/:id', (request, response) => {
    Person.findByID(request.params.id)
        .then(person => {
            response.json(person)
        })
})

app.delete ('/api/persons/:id', (request, response) => {
    Person.findByIdAndDelete(request.params.id)
    // const id = request.params.id
    // persons = persons.filter(person => person.id !== id)

    // response.status(204).end()
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

    // const nameExists = persons.some(person => person.name.toLowerCase() === body.name.toLowerCase())

    // if (nameExists) {
    //     return response.status(400).json({
    //         error: 'name must be unique'
    //     })
    // }
    
    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
})

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

