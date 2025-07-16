import { useState, useEffect } from 'react'
import './index.css'
import axios from 'axios'
import Filter from './components/Filter'
import Person from './components/Person'
import PersonForm from './components/PersonForm'
import personService from './services/persons'
import Notification from './components/Notification'


const App = () => {
  const [persons, setPersons] = useState([]) 
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [message, setMessage] = useState(null)
  const [messageType, setMessageType] = useState('success')

const showMessage = (text, type = 'success') => {
  setMessage(text)
  setMessageType(type)
  setTimeout(() => {
      setMessage(null)
    }, 5000)
}

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  const personsToShow = persons.filter(person => person.name.toLowerCase().includes(searchTerm.toLowerCase()))
  
  const addPerson = (event) => {
    event.preventDefault()

    const existingPerson = persons.find(person => person.name === newName)
    if (existingPerson) {
      const confirmUpdate = window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)

      if (!confirmUpdate) {
        return
      }
      

      const updatedPerson = { 
        ...existingPerson, 
        number: newNumber
      }

      personService
      .update(existingPerson.id, updatedPerson)
      .then(returnedperson => {
        setPersons(persons.map(p => p.id !== existingPerson.id ? p : returnedperson))
        setNewName('')
        setNewNumber('')
        showMessage(`Updated ${newName}'s number to ${newNumber}`)
      })
      .catch(error => {
        console.error('Error updating person:', error)
        if (error.response && error.response.status === 404) {
          setPersons(persons.filter(person => person.id !== existingPerson.id))
          showMessage(`Information for ${newName} has already been removed from the server`
            ,'error'
          )
        } else {
          showMessage(
            'Error updating person. Please try again.','error'
          )
        }
        setNewName('')
        setNewNumber('')
      })
    } else {
        const personObject = {
          name: newName,
          number: newNumber
        }
        personService
          .create(personObject)
          .then(returnedPerson => {
            setPersons(persons.concat(returnedPerson))
            setNewName('')
            setNewNumber('')
            showMessage(`Added ${newName}`)
          })
           .catch(error => {  // Add this error handling
              console.error('Error adding person:', error)
              showMessage('Error adding person. Please try again.','error')
            })
    }

    
  }

  const deletePerson = (id, name) => {
    const confirmDelete = window.confirm(`Delete ${name} ?`)

    if (!confirmDelete) {
      return
    }

    personService
    .deletePerson(id)
    .then(() => {
      setPersons(persons.filter(person => person.id !== id))
    })
    .catch(error => {
      console.error('Error deleting person', error)
      alert(`Error deleting person. Please try again`)
    })
    
  }
  
  const handleSearchChange = (event) => setSearchTerm(event.target.value)
  const handleNameChange = (event) => setNewName(event.target.value)
  const handleNumberChange = (event) => setNewNumber(event.target.value)
  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message} type={messageType}/>
      <Filter searchTerm={searchTerm} onSearchChange={handleSearchChange} />
      <h3>Add a new person</h3>
      <PersonForm 
        onSubmit={addPerson}
        newName={newName}
        onChangeName={handleNameChange}
        newNumber={newNumber}
        onChangeNumber={handleNumberChange}
      />
      <h2>Numbers</h2>
        <Person 
        persons = {personsToShow} 
        onDelete = {deletePerson}/>
    </div>
  )
}

export default App