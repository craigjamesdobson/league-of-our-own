/* eslint-disable camelcase */
import { extend } from 'vee-validate'
import { required, alpha, alpha_spaces, email } from 'vee-validate/dist/rules'

extend('email', email)

extend('min', {
  validate(value, args) {
    return value.length >= args.length
  },
  params: ['length'],
  message: 'The {_field_} field must have at least {length} characters',
})

extend('required', {
  ...required,
  message: 'This field is required',
})

extend('password', {
  params: ['target'],
  validate(value, { target }) {
    return value === target
  },
  message: 'Password confirmation does not match',
})

extend('password_strength', {
  validate(value) {
    const strongRegex = new RegExp(
      '([A-Za-z]+[0-9]|[0-9]+[A-Za-z])[A-Za-z0-9]*'
    )
    return strongRegex.test(value)
  },
  message: `The password must contain at least 1 letter and 1 number`,
})

extend('alpha', {
  ...alpha,
  message: 'This field must only contain alphabetic characters',
})

extend('alpha_spaces', {
  ...alpha_spaces,
  message: 'This field must only contain alphabetic characters and spaces',
})
