const mongoose = require('mongoose')

async function main() {
  if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
  }

  const password = process.argv[2]
  
  const url = `mongodb+srv://sf:${password}@cluster0.dh0jj.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Cluster0`
  mongoose.set('strictQuery', false)

  mongoose.connect(url)


  // {"id": "1",
  // "name": "Arto Hellas", 
  // "number": "040-123456"}
  const personSchema = new mongoose.Schema({
    id: String,
    name: String,
    number: String,
  })
  const Person = mongoose.model('Person', personSchema)


  const maxPerson  = await Person.findOne().sort({ id: -1 });
  const maxId = maxPerson ? parseInt(maxPerson.id) : 0;


  const record = new Person({
    id: maxId + 1,
    name: process.argv[3],
    number: process.argv[4]

  })

  await Person.create(record).then(result => {
    console.log('record saved!',result)
    this.mongoose.connection.close()
  })

}

main();