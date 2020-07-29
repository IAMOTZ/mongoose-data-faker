const mongoose = require('mongoose');
const { random } = require('faker');
const SingleNestedPath = require('mongoose/lib/schema/SingleNestedPath');
const SchemaArray = require('mongoose/lib/schema/array');
const DocumentArrayPath = require('mongoose/lib/schema/documentarray');

const { Schema } = mongoose;

const dataSchema = new Schema({
  firstName: String,
  lastName: String,
  dob: Date,
  nested: {
    someValues: Number
  }
});


const schema = new Schema({ 
  name: String,
  names: [{ type: mongoose.Types.ObjectId }],
  data1: dataSchema,
  data2: [dataSchema],

  data3: [ {firstName: String, lastName: String} ],

  data4: {
    firstName: String,
    lastName: String,
    dob: Date,
    nested: {
      someValues: Number
    }
  }
});




schema.paths; // { name: SchemaString { ... } }

schema.add({ age: { type: Number, min: 50, } });

schema.path('data4.firstName', Number);


schema.eachPath((path, schemaType) => {
  console.log('***path: ', path);
  if(schemaType instanceof DocumentArrayPath) {
    // console.log("ebdeded in document array: ", schemaType.schema)
    // console.log("ebdeded in document array2: ", schemaType.$embeddedSchemaType)

    // console.log("embedded schema type", schemaType.$embeddedSchemaType)
    // console.log('Overhere: ', schemaType.schema.paths);
  }
  console.log(schemaType.constructor.name)
})


// console.log(schema.childSchemas);

// const a = new mongoose.SchemaTypes.Number()

// console.log(a.constructor.name);

// console.log(schema.path('age') instanceof mongoose.Schema.Types.Number.);