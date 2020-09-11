const mongoose = require("mongoose");
const sinon = require('sinon');
const faker = require('faker/locale/en_US'); 
const code = require("../.");

expect.extend({
  toBeInteger(received) {
    const pass = Number.isInteger(received);
    return {
      pass,
      message: () => {
        if (!pass) return `expected ${received} to be an integer but it isn't`;
        else return `expected ${received} to not be an integer but it is`;
      },
    };
  },
  toBeDecimal(received) {
    const pass = typeof received === "number" && !Number.isInteger(received);
    return {
      pass,
      message: () => {
        if (!pass) return `expected ${received} to be a Decimal but it isn't`;
        else return `expected ${received} to not be a Decimal but it is`;
      },
    };
  },
});

const { Schema } = mongoose;

describe("mongoose-data-faker-generator", () => {
  describe("SchemaString", () => {
    it("should generate a length of random strings", () => {
      let schema = new Schema({ name: { type: String } });

      const result = code(schema, 3);

      expect(result).toEqual(expect.any(Array));
      expect(result).toHaveLength(3);
      result.forEach((res) => {
        expect(res.name).toEqual(expect.any(String));
      });
    });

    it("should generate uppercase string", () => {
      const schema = new Schema({ name: { type: String, uppercase: true } });

      const result = code(schema, 1);
      expect(result).toHaveLength(1);
      expect(result[0].name).not.toMatch(/[a-z]/g);
    });

    it("should generate lowercase string", () => {
      const schema = new Schema({ name: { type: String, lowercase: true } });

      const result = code(schema, 1);
      expect(result).toHaveLength(1);
      expect(result[0].name).not.toMatch(/[A-Z]/g);
    });

    it("should generate string from one of enum values", () => {
      const enumValues = ["Tunmise", "Ogunniyi", "Oyindamola"];
      // Can I dynamically compose the regexp value below so I only hvae to think about the enumValues
      const enumRegExp = /^(Tunmise)|(Ogunniyi)|(Oyindamola)$/;
      const schema = new Schema({ name: { type: String, enum: enumValues } });

      const result = code(schema, 1);

      expect(result[0].name).toMatch(enumRegExp);
    });

    it("should trim the generated string", () => {
      const unTrimmedString = "  Tunmise  ";
      sinon.stub(faker.random, 'word').callsFake(() => unTrimmedString);

      let schema = new Schema({ name: { type: String, trim: true } });

      const result = code(schema, 1);

      expect(result[0].name).toEqual(unTrimmedString.trim());
      faker.random.word.restore();
    });

    it("should generate string with a max length", () => {
      const longString = "Funmilayo";
      sinon.stub(faker.random, 'word').callsFake(() => longString);

      let schema = new Schema({ name: { type: "String", maxlength: 5 } });

      const result = code(schema, 1);

      expect(result[0].name).toHaveLength(5);
      expect(result[0].name).toEqual(longString.slice(0, 5));
      faker.random.word.restore();
    });

    it("should generate string with faker option", () => {
      const fakerString = "Olaide";
      sinon.stub(faker.name, 'firstName').callsFake(() => fakerString);

      let schema = new Schema({
        name: { type: "String", faker: "name.firstName" },
      });

      const result = code(schema, 1);

      expect(result[0].name).toEqual(fakerString);
      faker.name.firstName.restore();
    });
  });

  describe("SchemaNumber", () => {
    it("should generate a length of random numbers", () => {
      let schema = new Schema({ age: { type: Number } }, { _id: false });

      const result = code(schema, 3);

      expect(result).toEqual(expect.any(Array));
      expect(result).toHaveLength(3);
      result.forEach((res) => {
        expect(res.age).toEqual(expect.any(Number));
      });
    });

    it("should generate number from enum values", () => {
      const enumValues = [3, 5, 50];
      const schema = new Schema({ age: { type: Number, enum: enumValues } });

      const result = code(schema, 1);

      expect(enumValues.includes(result[0].age)).toEqual(true);
    });

    it("should generate number less than or equal to the max schema type option", () => {
      const maxOption = 50;
      let schema = new Schema({ name: { type: Number, max: maxOption } });

      const result = code(schema, 1);

      expect(result[0].name).toBeLessThanOrEqual(maxOption);
    });

    it("should generate number greater than or equal to the min schema type option", () => {
      const minOption = 20;
      let schema = new Schema({ name: { type: Number, min: minOption } });

      const result = code(schema, 1);

      expect(result[0].name).toBeGreaterThanOrEqual(minOption);
    });
  });

  describe("SchemaDecimal123", () => {
    it("should generate a length of random decimal numbers", () => {
      let schema = new Schema({ age: { type: Schema.Types.Decimal128 } });

      const result = code(schema, 3);

      expect(result).toEqual(expect.any(Array));
      expect(result).toHaveLength(3);
      result.forEach((res) => {
        expect(res.age).toBeDecimal();
      });
    });
  });

  describe("SchemaBoolean", () => {
    it("should generate a length of random booleans", () => {
      let schema = new Schema({ isMarried: { type: Boolean } });

      const result = code(schema, 3);

      expect(result).toEqual(expect.any(Array));
      expect(result).toHaveLength(3);
      result.forEach((res) => {
        expect(res.isMarried).toEqual(expect.any(Boolean));
      });
    });
  });

  describe("SchemaDate", () => {
    it("should generate a length of random dates", () => {
      let schema = new Schema({ dateOfBirth: { type: Date } });

      const result = code(schema, 3);

      expect(result).toEqual(expect.any(Array));
      expect(result).toHaveLength(3);
      result.forEach((res) => {
        expect(res.dateOfBirth).toEqual(expect.any(Date));
      });
    });

    it("should generate date values less than or equal to the max schema type option", () => {
      const maxOption = new Date(Date.now());

      let schema = new Schema({ dateOfBirth: { type: Date, max: maxOption } });

      const result = code(schema, 1);

      expect(result[0].dateOfBirth.getTime()).toBeLessThanOrEqual(
        maxOption.getTime()
      );
    });

    it("should generate date values greater than or equal to the min schema type option", () => {
      const minOption = new Date(Date.now());
      let schema = new Schema({ dateOfBirth: { type: Date, min: minOption } });

      const result = code(schema, 1);

      expect(result[0].dateOfBirth.getTime()).toBeGreaterThanOrEqual(
        minOption.getTime()
      );
    });

    it("should generate date values between the min and max schema type option", () => {
      const minOption = new Date(Date.now());
      const maxOption = new Date(Date.now() + 100000000);
      let schema = new Schema({
        dateOfBirth: { type: Date, min: minOption, max: maxOption },
      });

      const result = code(schema, 1);

      expect(result[0].dateOfBirth.getTime()).toBeGreaterThanOrEqual(
        minOption.getTime()
      );
      expect(result[0].dateOfBirth.getTime()).toBeLessThanOrEqual(
        maxOption.getTime()
      );
    });
  });

  describe("SchemaObjectId", () => {
    it("should generate a length of random ObjectIds", () => {
      let schema = new Schema({ identifier: { type: Schema.Types.ObjectId } });

      const result = code(schema, 3);

      result.forEach((res) => {
        expect(res.identifier).toEqual(expect.any(String));
        expect(mongoose.isValidObjectId(res.identifier)).toEqual(true);
      });
    });
  });

  describe("SchemaBuffer", () => {
    it("should generate a length of random buffer objects", () => {
      const bufferData = 'Tunmise';
      sinon.stub(faker.random, 'word').callsFake(() => bufferData);
      
      let schema = new Schema({ data: { type: Buffer } });

      const result = code(schema, 3);

      result.forEach((res) => {
        expect(Buffer.isBuffer(res.data)).toEqual(true);
        expect(res.data.toString()).toEqual(bufferData);
      });
    });
  });

  describe("SchemaMixed", () => {
    it("should generate a length of any random type", () => {
      let schema = new Schema({ data: {} });

      const result = code(schema, 3);

      result.forEach((res) => {
        expect(res.data).not.toBeUndefined();
        expect(res.data).not.toBeNull();
      });
    });
  });

  describe("SchemaArray", () => {
    // @todo: I can have this as a data driven tests and test that it generates well for the different primitive types
    // @todo: Repeat this test for all other primitive types
    it("should generate a length of random arrays of string", () => {
      let schema = new Schema({ friends: [String] });

      const result = code(schema, 3);

      expect(result).toEqual(expect.any(Array));
      expect(result).toHaveLength(3);

      result.forEach((res) => {
        expect(res.friends).toEqual(expect.any(Array));
        expect(res.friends).toHaveLength(1);
        expect(res.friends[0]).toEqual(expect.any(String));
      });
    });

    it("should generate a length of random arrays of nested documents", () => {
      let schema = new Schema({ friends: [{ name: String, age: Number }] });

      const result = code(schema, 3);

      expect(result).toEqual(expect.any(Array));
      expect(result).toHaveLength(3);

      result.forEach((res) => {
        expect(res.friends).toEqual(expect.any(Array));
        expect(res.friends).toHaveLength(1);
        expect(res.friends[0]).toMatchObject({
          name: expect.any(String),
          age: expect.any(Number),
        });
      });
    });

    it("should generate a length of random arrays of sub documents", () => {
      const friendSchema = new Schema({ name: String, age: Number });

      let schema = new Schema({ friends: [friendSchema] });

      const result = code(schema, 3);

      expect(result).toEqual(expect.any(Array));
      expect(result).toHaveLength(3);

      result.forEach((res) => {
        expect(res.friends).toEqual(expect.any(Array));
        expect(res.friends).toHaveLength(1);
        expect(res.friends[0]).toMatchObject({
          name: expect.any(String),
          age: expect.any(Number),
        });
      });
    });
  });

  describe("Nested Schemas", () => {
    it("should generate random values for nested paths", () => {
      let schema = new Schema({
        data: { firstName: String, lastName: String },
      });

      const result = code(schema, 3);

      expect(result).toEqual(expect.any(Array));
      expect(result).toHaveLength(3);

      result.forEach((res) => {
        expect(res).toMatchObject({
          data: {
            firstName: expect.any(String),
            lastName: expect.any(String),
          },
        });
      });
    });

    it("should generate random values for sub documents", () => {
      const dataSchema = new Schema({ firstName: String, lastName: String });
      let schema = new Schema({ data: dataSchema });

      const result = code(schema, 3);

      expect(result).toEqual(expect.any(Array));
      expect(result).toHaveLength(3);

      result.forEach((res) => {
        expect(res).toMatchObject({
          data: {
            firstName: expect.any(String),
            lastName: expect.any(String),
          },
        });
      });
    });
  });
});

describe("load test", () => {});
