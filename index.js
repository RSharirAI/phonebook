require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()

app.use (express.json())
app.use(express.static('dist'))
morgan.token('post-body', (request, response) => {
  if (request.method === 'POST') {
    return JSON.stringify(request.body)
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

app.get('/api/info', (request, response, next) => {
  const currentTime = new Date().toString()

  Person.countDocuments({})
    .then(personsCount => {
      const infoHtml = `
                <div>
                <p>Phonebook has info for ${personsCount} people</p>
                <p>${currentTime}</p>
                </div>
            `

      response.send(infoHtml)
    })
    .catch(error => next(error))

})

app.get ('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)

      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.post ('/api/persons', (request, response, next) => {
  const body = request.body

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.delete ('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put ('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findById(request.params.id)
    .then(person => {
      if (!person) {
        return response.status(404).end()
      }

      person.name = name
      person.number = number

      return person.save()
        .then(updatedPerson => {
          response.json(updatedPerson)
        })
    })
    .catch(error => next(error))
})


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

