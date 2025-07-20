const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://sharirlearning:${password}@phonebook.3g4rxdx.mongodb.net/?retryWrites=true&w=majority&appName=phonebook`
mongoose.set('strictQuery',false)
mongoose.connect(url)
  .then(() => {
    console.log('Connected to MongoDB successfully!')
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 5) {
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4],
    })

    person.save().then(result => {
        console.log(`added ${process.argv[3]} number ${process.argv[4]} to phonebook`)
        mongoose.connection.close()
    })
} else if (process.argv.length === 3) {
    console.log('phonebook:')
    Person.find().then(persons => {
        persons.forEach(person => {
            console.log(`${person.name} ${person.number}`)
        })
        mongoose.connection.close()
    })
} else {
    console.log('give name and number as argument')
    mongoose.connection.close()
    exit(1)
}
