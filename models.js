const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

require('dotenv').config()

const password = process.env.MONGODB_PASSWORD
const url = process.env.MONGODB_URI.replace('${password}', password)
console.log('MONGODB_URI:', process.env.MONGODB_URI)


console.log('connecting to', url)

mongoose.connect(url)

    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch(error => {
        console.log('error connecting to MongoDB:', error.message)
    })

const personSchema = new mongoose.Schema({
    content: String,
    important: Boolean,
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})


module.exports = mongoose.model('Person', personSchema)


