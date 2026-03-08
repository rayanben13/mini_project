import Joi from 'joi';
const passwordRegex =
  /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,128}$/;

const email = Joi.string()
  .email({ tlds: { allow: ['com'] } })
  .max(100)
  .trim()
  .required();

const password = Joi.string().pattern(passwordRegex).required();

const username = Joi.string().alphanum().min(3).max(30).trim();
const fullname = Joi.string().min(3).max(30).trim();
export const shemaPassword = Joi.object({ email, password });
export const authSchema = Joi.object({
  email,
  password,
  username: username.required(),
  fullname: fullname.required(),
});
export const shemaUsername = Joi.object({ username: username.optional() });
export const schemaEmail = Joi.object({ email });
