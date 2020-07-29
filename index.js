const faker = require('faker');
const mongoose = require('mongoose');
const SingleNestedPath = require('mongoose/lib/schema/SingleNestedPath');
const DocumentArrayPath = require('mongoose/lib/schema/documentarray');
const _set = require('lodash/object').set;


const { Schema } = mongoose;


const isValidSchema = (schema) => {
  // @todo: Compose this, 
  return true;
}

const isValidSchemaType = (schemaTypeOptions) => {
  // @todo: Implement this
  return true;
}

const selectFromEnum = (typeOptions) => {
  if(!Array.isArray(typeOptions.enum)) return null;

  const selector = Math.floor(Math.random() * typeOptions.enum.length);
  return typeOptions.enum[selector];
}

const types = {
  [mongoose.SchemaTypes.String.name]: {
    generator: (schemaType) => {
      const schemaTypeOptions = schemaType.options;

      const enumSelection = selectFromEnum(schemaTypeOptions);
      if(enumSelection) return enumSelection;

      let value = '';
      // @todo: Extend mongoose.Schema.String.Options to accept faker options

      // @todo: Figure out how I want to validate faker options
      if(typeof schemaTypeOptions.faker === 'string' && typeof faker[schemaTypeOptions.faker] === 'function') {
        // @todo: Strings combined with . won't help be acess object the way I think, I should fix this
        value = faker[schemaTypeOptions.faker]();
      } else value = faker.random.word();

      const { lowercase, uppercase, trim, minLength, maxLength } = schemaTypeOptions;
      if(lowercase) value = value.toLowerCase();
      if(uppercase) value = value.toUpperCase();
      if(trim) value = value.trim();
      if(minLength) value = value; // @todo: How do I ensure a min length for string values
      if(maxLength) value = value; // @todo: How do I ensure a max length for string values
    
      return value;
    },
  },
  [mongoose.SchemaTypes.Number.name]: {
    generator: (schemaType) => {
      const schemaTypeOptions = schemaType.options;

      const enumSelection = selectFromEnum(schemaType);
      if(enumSelection) return enumSelection;

      // @todo-p1: Use faker option here
      const min = typeof schemaTypeOptions.min === 'number' ? schemaTypeOptions.min : 0;
      const max = typeof schemaTypeOptions.max === 'number' ? schemaTypeOptions.max : faker.random.number();
      const threashold = max - min;
      const randomizer = Math.round(Math.random() * threashold);

      return min + randomizer;
    },
  },
  [mongoose.SchemaTypes.Decimal128.name]: {
    generator: (schemaType) => {
      const schemaTypeOptions = schemaType.options;
      
      const enumSelection = selectFromEnum(schemaType);
      if(enumSelection) return enumSelection;
    
      // @todo-p1: Use faker option here
      const min = typeof schemaTypeOptions.min === 'number' ? schemaTypeOptions.min : 0;
      const max = typeof schemaTypeOptions.max === 'number' ? schemaTypeOptions.max : faker.random.number();
      const threashold = max - min;
      const randomizer = (Math.random() * threashold).toFixed(3);
  
      return min + Number(randomizer);
    },
  },
  [mongoose.SchemaTypes.Date.name]: {
    generator: (schemaType) => {
      const schemaTypeOptions = schemaType.options;

      // @todo-p1: Use faker option here
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
  [mongoose.SchemaTypes.Array.name]: {
    /**
     * @param {mongoose.SchemaTypes.Array} schemaType 
     */
    generator: (schemaType) => {
      // This guy can accept enum options in case of array of strings and array of numbers
      // get embedded Schemat Type
      // Generate one of that type

      // @todo: Confirm api usage
      // const embeddedSchemaType = schemaType.$embeddedSchemaType;
      // I need to handle case of possiblity of when embeddedSchematpye is an ObjectId
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
      return [main(schemaType.schema, 1)]
    }
  }
}



const main = (schema, count) => {
  if(!isValidSchema(schema)) {
    // @todo: fail
  }


  const result = [];
  // Loop for count
  // @todo: It would be really cool if I can execute this loop in parallel

  for(let i = 0; i < count; i++) {

    const tree = {};

    schema.eachPath((path, schemaType) => {
      if(!isValidSchemaType(schemaType)) {
        // I think mongoose already validates the Schema, I'm not sure I need to do this
        throw Error(`Schema definition for path: ${path} is not valid`);
      }
    
      // @todo: Properly think about the usage of constructor.name
      // as mongoose did not promise what value to be returned
      if(!types[schemaType.constructor.name]) {
        throw Error('Type does not have a generator')
      }

      const value = types[schemaType.constructor.name].generator(schemaType);

      _set(tree, path, value);
    })
    result.push(tree);
  }

  return result;
}



const dataSchema = new Schema({
  firstName: String,
  meta: {
    age: Number
  }
});

const result = main( new mongoose.Schema({
  _id: mongoose.SchemaTypes.ObjectId,
  name: String, 
  age: Number,
  dateOfBirth: {
    type: Date,
    default: Date.now,
  },
  active: Boolean,
  data: mongoose.SchemaTypes.Mixed,
  balance: mongoose.SchemaTypes.Decimal128,
  friends: [{ type: mongoose.SchemaTypes.String, enum: ['Jannet', 'Bola', 'Tunmise']}],
  data: dataSchema
}), 20);

console.log('====>', result);


/*

@stoppped: I'm trying to test for DocumentArrayPath case

- How do I know if to generate _id for nested document schema
- Almost all my types should be able to receive faker support


TODO:
- Handle case of when givenType is an array or a nested document

- Generating randome array

- Implement validation for correct schema
- Implement validation for correct shcema option

- How do I ensure a min length for string values
- How do I ensure a min length for string values

P1
- What if the user is using a custom plugin that is adding a custom schema type that
this package is not aware of
*/