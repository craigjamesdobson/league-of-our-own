/* eslint-disable camelcase */
import { extend } from 'vee-validate'
import { required, alpha, alpha_spaces } from 'vee-validate/dist/rules'

extend('required', {
  ...required,
  message: 'This field is required',
})

extend('alpha', {
  ...alpha,
  message: 'This field must only contain alphabetic characters',
})

extend('alpha_spaces', {
  ...alpha_spaces,
  message: 'This field must only contain alphabetic characters and spaces',
})
