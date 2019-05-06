const Parameter = require('parameter');
const validator = new Parameter();

function ValidateErr(message) {
  this.message = '参数验证失败';
  this.stack = message;
}

/**
  * 使用规则验证数据
  *
  * @param  {Object} rules  - validate rule object, see [parameter](https://github.com/node-modules/parameter)
  * @param  {Object} [data] - validate target
  */
const validate =  (data, rules) => {
  const errors = validator.validate(rules, data);
  if (errors) {
    throw new ValidateErr(errors);
  }
};

module.exports = validate;


// let rule = {
//   name: 'string',
//   age: { type: 'int', max: 200 },
//   gender: ['male', 'female'],
//   working: 'boolean',
//   salary: { type: 'number', min: 0 },
//   birthday: 'date',
//   now: 'dateTime',
//   id: 'id',
//   childrens: {
//     type: 'array',
//     itemType: 'object',
//     required: false,
//     rule: {
//       name: 'string',
//       age: 'int',
//       gender: ['male', 'female'],
//       birthday: { type: 'date', required: false }
//     }
//   },
//   mate: {
//     type: 'object',
//     required: false,
//     rule: {
//       name: 'string',
//       age: 'int',
//       gender: ['male', 'female'],
//       birthday: { type: 'date', required: false }
//     }
//   }
// };

// let valid = {
//   name: 'foo',
//   gender: 'male',
//   age: 30,
//   working: true,
//   salary: 10000.1,
//   birthday: '1990-01-01',
//   now: '2015-01-07 00:00:00',
//   id: '052111',
//   childrens: [{
//     name: 'bar1',
//     age: 1,
//     gender: 'female',
//     birthday: '2014-01-01'
//   }, {
//     name: 'bar2',
//     age: 2,
//     gender: 'male',
//     birthday: '2013-01-01'
//   }],
//   mate: {
//     name: 'hee',
//     age: 29,
//     gender: 'female'
//   }
// };

// let invalid = {
//   name: 1,
//   gender: 'male1',
//   age: 300,
//   working: 'true',
//   salary: '10000.1',
//   birthday: '1990-01-011',
//   id: '052111x',
//   childrens: [{
//     name: 'bar1',
//     gender: 'female',
//     birthday: '2014-01-01'
//   }, {
//     name: 'bar2',
//     age: 2,
//     birthday: '2013-01-01'
//   }],
//   mate: {
//     age: 29,
//     gender: 'female'
//   }
// };
