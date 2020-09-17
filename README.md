# Mongoose Data Faker
Generate random fake data with your mongoose schema. Demo application is available [here](https://mongoose-data-faker.herokuapp.com/).

## Installation
```bash
# Using npm
npm i mongoose-data-faker

# Using yarn
yarn add mongoose-data-faker
```

## Usage  

```javascript
const { generate } = require('mongoose-data-faker'); 
const { Schema } = require('mongoose');

// This is just an example schema, feel free to use something more complicated
const sampleSchema = new Schema({
  name: String,
  age: Number
});

generate(sampleSchema, 50);

/* RESULT:
  [
    {
      name: 'gbemisola', // This can be any random string
      age: 40 // This can be any random number
    }
    // ...49 more objects in this array
  ]
*/
```
## SchemaType options
Mongoose-data-faker would try as much as possible to respect the standard mongoose [schemaType options](https://mongoosejs.com/docs/schematypes.html#schematype-options) that makes sense for data generation. This is a list of some schema type options and how mongoose-data-faker would use them for data generation:

### String
- String#lowercase - Generated string is always in lower case
- String#uppercase - Generated string is always in uppercase
- String#enum - Generated string is always one of the provided enum values
- String#maxlength - Generated string length is always lesser or equal to `maxlength`

### Numbers
- Number#min - Generated number is always greater than or equal to `min`
- Number#max - Generated number is always lesser than or equal to `max`
- String#enum - Generated number is always one of the provided enum values

### Date
- Date#min - Generated date is always greater than or equal to `min`
- Date#max - Generated date is always lesser than or equal to `max`

For eample:

```javascript
const schema = new Schema({
  // name would always be one of 'olaide', 'oyindamola' or 'gbemisola'
  name: {
    type: String,
    enum: ['olaide', 'oyindamola', 'gbemisola']
  },
  // age would always be greater than or equal to 18
  age: {
    type: Number,
    min: 18,
  },
  // createdAt would always be greated than or equal to 
  // 1598308338428(unix time stamp)
  createdAt: {
    type: Date,
    min: 1598308338428,
  }
})
```

## Using FakerJS
Mongoose-data-faker supports using [Faker](https://www.npmjs.com/package/faker) for generating specific types of string values. You can specify a faker property in the schemaTypeOption to use a specific faker API, for example:

```javascript
const user = {
  name: {
    type: String,
    // Generate a random firstName with faker
    faker: 'name.firstName',
  },
  email: {
    type: String,
	// Generate a random email with faker
	faker: 'internet.email',
 },
 phoneNumber: {
   type: String,
  //  Generate a random phone number with faker
   faker: 'phone.phoneNumber',
 },
 zipCode: {
   type: String,
  //  Generate a random zipcode with faker
   faker: 'address.zipCode'
 }
}
const schema = new Schema(user);

// Generate 10 random user object
generate(schema, 10);
```

## Limitations
### Custom schema type
Mongoose-data-faker currently does not support generation for custom schema type and this is simply because it does not recognize any custom schema type and consequently can't tell what data to generate for them. In the future, I hope to be able to add a way with which you can register your custom data types as well as custom generators. For now, the package would throw an error if it comes across a schema type it does not recognize.


## Inspiration
I answer questions about MongoDB and Mongoose [on StackOverflow](https://stackoverflow.com/users/7685866/tunmee). More than often when people ask questions, they simply post their mongoose schema, and in the process of trying to answer their questions, I need to test out some queries on actual data. I find myself manually composing sample data and this consumes a lot of valuable time. 

I researched existing tools but everything I came across requires me to learn some form of syntax for data generation, I did not want to do that, I want something I can just point my schema to and flexibly generate as much data as I want... No stress... No hassle.

While the inspiration for this project is from answering questions on StackOverflow, the usage is not limited to that, you can use the project for any other use-case you see fit.


## Contribution
Contributions are highly welcomed. To contribute to this project:

- Fork the [repository](https://github.com/IAMOTZ/mongoose-data-faker)
- Create a new branch for your contribution in the forked repo
- Commit your changes with detailed commit messages
- Raise a pull request from your forked repository to the main repository.
