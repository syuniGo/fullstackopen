const Person = require('./models/person')

async function main() {
    const recordsToDelete = await Person.find({ name: { $exists: false } });
console.log('将要删除的记录:', recordsToDelete);

// 确认无误后再删除
const deleteResult = await Person.deleteMany({ name: { $exists: false } });
console.log('删除的记录数:', deleteResult.deletedCount);
}
main()