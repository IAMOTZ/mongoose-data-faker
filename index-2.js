const { random } = require('faker');

const isValidSchema = (schema) => {
  // @todo: Compose this, Try using yup for this validation
  return true;
}

const isValidSchemaTypeOption = (schemaTypeOptions) => {
  // @todo: Implement this
  return true;
}

const types = {
  'string': {
    generator: (options = {}) => {
      const { 
        lowercase, uppercase, trim, minLength, maxLength, faker,
      } = options;

      if(options.enum) {
        const selector = Math.floor(Math.random() * options.enum.length);
        return options.enum[selector];
      }
      let value = '';
      // @todo: How do I intend to accept faker settings
      if(faker) value = ''; // @todo: User faker optoin to generate the random string
      else value = random.word();
      if(lowercase) value = value.toLowerCase();
      if(uppercase) value = value.toUpperCase();
      if(trim) value = value.trim();
      if(minLength) value = value; // @todo: How do I ensure a min length for string values
      if(maxLength) value = value; // @todo: How do I ensure a max length for string values
      return value;
    },
  },
  'number': {
    generator: (options = {}) => {
      const { min = 0, max = random.number() } = options;
      if(options.enum) {
        const selector = Math.floor(Math.random() * options.enum.length);
        return options.enum[selector];
      }
      // @todo: Is the threashold variable name a good one
      const threashold = max - min;
      const randomizer = Math.round(Math.random() * threashold)
      return min + randomizer;
    },
  },
  'decimal128': {
    generator: (options = {}) => {
      const { min = 0, max = random.number() } = options;
      if(options.enum) {
        const selector = Math.floor(Math.random() * options.enum.length);
        return options.enum[selector];
      }
      const threashold = max - min;
      const randomizer = (Math.random() * threashold).toFixed(3);
      return min + Number(randomizer);
    },
  },
  'date': {
    generator: (options = {}) => {
      const { min = new Date(0), max = new Date() } = options;
      const threashold = max.getTime() - min.getTime();
      const randomizer = Math.round((Math.random() * threashold));
      return new Date(min.getTime() + randomizer);
    },
  },
  'objectid': {
    generator: () => {
      // Source: https://gist.github.com/solenoid/1372386
      var timestamp = (new Date().getTime() / 1000 | 0).toString(16);
      return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function() {
          return (Math.random() * 16 | 0).toString(16);
      }).toLowerCase();
    },
  },
  'boolean': {
    generator: () => {
      const values = [true, false];
      const selector = Math.round(Math.random());
      return values[selector];
    },
  },
  'array': {
    generator: () => {
      // @todo: Leaving this for now, implement it afterwards
      return [];
    },
  },
  'mixed': {
    generator: () => {
      const options = ['number', 'string', 'boolean', 'objectid', 'date'];
      const selector = Math.floor(Math.random() * options.length);
      const result = types[options[selector]].generator();
      return result;
    },
  },
}

const generate = (count, givenType) => {

  let type = givenType;
  let options = {};

  if (typeof givenType === "object" && givenType.constructor.name === 'Object') {
    // @todo: I need to handle case of when givenType is an array
    // or when givenType is just an object describing a nested document
    ({ type, ...options } = givenType);
  }

  if(options && !isValidSchemaTypeOption(type)) {
    throw Error('Type options is not valid');
  }

  if(typeof type !== 'string') {
    // Fail early
    throw Error('Given type must be a string')
  }

  if(!types[type.toLowerCase()]) {
    // Fail early
    throw Error('Type does not have a generator')
  }

  const result = [];

  while(count > 0) {
    result.push(types[type.toLowerCase()].generator(options));
    count -= 1;
  }

  return result;
}

const main = (schema, count) => {
  if(!isValidSchema(schema)) {
    // @todo: fail
  }

  const tree = {};
  // schema.eachPath((pathName, schemaType) => {
  //   tree[pathName] = generate(count, schemaType);
  // })

  const schemaEntries = Object.entries(schema);
  schemaEntries.forEach(([key, type]) => {

    tree[key] = generate(count, type);
  });

  const output = [];

  for(let i = 0; i < count; i++) {
    output.push(extract(tree, i))
  }

  return output;
}

const extract = (tree, index) => {
  return Object.keys(tree).reduce((acc, curr) => {
    acc[curr] = tree[curr][index];
    return acc;
  }, {})
}

const result = main({
  _id: 'objectid',
  name: 'string', // @todo: What if I can just use String itself, instead of having a string
  age: 'number',
  dateOfBirth: 'date',
  active: 'boolean',
  data: 'mixed',
  balance: 'decimal128'
}, 20);

console.log('====>', result);


/*

- How do I know if to generate _id for nested document schema
- How do I serialize the types given in the input into something my code can understand?
- - do I even need to serialize them
- Almost all my types should be able to receive faker support


TODO:
- Executing javascript in the window or not
- Handle case of when givenType is an array or a nested document

- How do I intend to accept faker settings
- User faker optoin to generate the random string
- How do I ensure a min length for string values
- How do I ensure a min length for string values

- Implement validation for correct schema
- Implement validation for correct shcema option

- Is the threashold variable name a good one

- Array generator
*/