const faker = require('faker/locale/en_US'); 
const { set: _set, get: _get } = require('lodash/object');
const mongoose = require('mongoose');
const SingleNestedPath = require('mongoose/lib/schema/SingleNestedPath');
const DocumentArrayPath = require('mongoose/lib/schema/documentarray');


const selectFromEnum = (typeOptions) => {
  if(!Array.isArray(typeOptions.enum)) return null;

  const selector = Math.floor(Math.random() * typeOptions.enum.length);
  return typeOptions.enum[selector];
}

// @todo: I thikn I can use a map to compose this types object so that 
// I won't have to  do schemaType.[Type].name just to get a string... a function can hold as key
const types = {
  [mongoose.SchemaTypes.String.name]: {
    generator: (schemaType) => {
      const schemaTypeOptions = schemaType.options;

      const enumSelection = selectFromEnum(schemaTypeOptions);
      if(enumSelection) return enumSelection;

      let value = '';

      if(typeof schemaTypeOptions.faker === 'string' && typeof _get(faker, schemaTypeOptions.faker) === 'function') {
        value = _get(faker, schemaTypeOptions.faker)();
      } else value = faker.random.word();

      const { lowercase, uppercase, trim, minlength, maxlength } = schemaTypeOptions;
      if(lowercase) value = value.toLowerCase();
      if(uppercase) value = value.toUpperCase();
      if(trim) value = value.trim();
      if(minlength && value.length < minlength) value = value; // @todo: How do I ensure a min length for string values
      if(maxlength && value.length > maxlength) value = value.slice(0, maxlength);
    
      return value;
    },
  },
  [mongoose.SchemaTypes.Number.name]: {
    generator: (schemaType) => {
      const schemaTypeOptions = schemaType.options;

      const enumSelection = selectFromEnum(schemaTypeOptions);
      if(enumSelection) return enumSelection;

      const min = typeof schemaTypeOptions.min === 'number' ? schemaTypeOptions.min : 0;
      const max = typeof schemaTypeOptions.max === 'number' ? schemaTypeOptions.max : faker.random.number();
      const threashold = max - min;
      const randomizer = Math.round(Math.random() * threashold);

      return min + randomizer;
    },
  },
  [mongoose.SchemaTypes.Decimal128.name]: {
    generator: () => {
      const randomDecimalString = (Math.random() * faker.random.number()).toFixed(3);
  
      return Number(randomDecimalString);
    },
  },
  [mongoose.SchemaTypes.Date.name]: {
    generator: (schemaType) => {
      const schemaTypeOptions = schemaType.options;

      const min = schemaTypeOptions.min instanceof Date ? schemaTypeOptions.min : new Date(0);
      const max = schemaTypeOptions.max instanceof Date ? schemaTypeOptions.max : new Date();
      const threashold = max.getTime() - min.getTime();
      const randomizer = Math.round((Math.random() * threashold));
    
      return new Date(min.getTime() + randomizer);
    },
  },
  [mongoose.SchemaTypes.ObjectId.name]: {
    generator: () => {
      return mongoose.Types.ObjectId().toHexString();
    },
  },
  [mongoose.SchemaTypes.Boolean.name]: {
    generator: () => {
      const values = [true, false];
      const selector = Math.round(Math.random());
      return values[selector];
    },
  },
  [mongoose.SchemaTypes.Buffer.name]: {
    generator: () => {
      const randomString = faker.random.word();
      return Buffer.from(randomString);
    },
  },
  [mongoose.SchemaTypes.Array.name]: {
    /**
     * @param {mongoose.SchemaTypes.Array} schemaType 
     */
    generator: (schemaType) => {
      // @todo: Confirm api usage
      const embeddedType = schemaType.$embeddedSchemaType;
      if(!types[embeddedType.constructor.name]) {
        throw Error('Schemat type does not have a generator at path ??')
      }
      const result = types[embeddedType.constructor.name].generator(embeddedType);
      return [result];
    },
  },
  [mongoose.SchemaTypes.Mixed.name]: {
    generator: () => {
      // @todo: Mongoose frown upon instantiating any of the class listed in the options
      // array, confirm if that's just a guide or there is a solid reason behind it
      const options = [
        mongoose.SchemaTypes.String,
        mongoose.SchemaTypes.Number,
        mongoose.SchemaTypes.Decimal128,
        mongoose.SchemaTypes.Boolean,
        mongoose.SchemaTypes.Date,
      ];
      const selector = Math.floor(Math.random() * options.length);
      const SelectedType = options[selector];
      const result = types[SelectedType.name].generator(new SelectedType());
      return result;
    },
  },
  [SingleNestedPath.name]: {
    generator: (schemaType) => {
      return main(schemaType.schema, 1)[0]
    }
  },
  [DocumentArrayPath.name]: {
    generator: (schemaType) => {
      return main(schemaType.schema, 1)
    }
  }
}



const main = (schema, count) => {

  const result = [];
  // @todo: It would be really cool if I can execute this loop in parallel

  for(let i = 0; i < count; i++) {

    const tree = {};

    schema.eachPath((path, schemaType) => {
    
      // @todo: Confirm api usage
      if(!types[schemaType.constructor.name]) {
        throw Error(`Sorry 😔, the schema type for path ${path} does not have a generator`)
      }

      const value = types[schemaType.constructor.name].generator(schemaType);

      _set(tree, path, value);
    })
    result.push(tree);
  }

  return result;
}

module.exports.core = main;
module.exports.runkitView = require('./runkit');




/*

TODO:

Testing
- Load testing - how the module behaves for very large amount of generation
* It's fine if it takes a lot of time to complete, what it shouldn't do is max out the memory
* Should I add restriction on the amount of data generatable
  * I think it would be wise to add the restriction on the size of the data and not just the amount of data as schema size would differ

- Complex schemas - testing different combination of complex schemas
- Schema Size - hwo the module behaves for very large achema size that I might want to even generate a little number of data for

P1
- Execute generation loop in parallel
- What if the user is using a custom plugin that is adding a custom schema type that
this package is not aware of - I may need to expose an API that would allow people extend or add their own generators
- Add a way to specify the number of documents to generate in an array 
- How do I ensure a min length for string values
- More than often, peole would want unique values for specific schema type, how can I ensure this?

P2
- I can make the core generation code available via CLI as well as a npm package
*/