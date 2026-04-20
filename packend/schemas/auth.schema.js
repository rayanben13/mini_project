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

const univ = Joi.string().min(3).max(50).trim().required();
const major = Joi.string().min(3).max(30).trim().required();

const years = ['L1', 'L2', 'L3', 'M1', 'M2'];
const type_file = ['TD', 'TP', 'COURS', 'EF', 'CC', 'RESUME', 'OTHER'];

const academic_year = Joi.string()
  .valid(...years)
  .required();

const spercialty = Joi.string()
  .min(2)
  .max(30)
  .trim()
  .when('academic_year', {
    is: Joi.valid('M1', 'M2'),
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  });

export const schemaUpdateProfile = Joi.object({
  fullname: fullname.required(),
  univ: univ.required(),
  major: major.required(),
  spercialty: spercialty.required(),
  academic_year: academic_year.required(),
});
export const schemaUserInformation = Joi.object({
  univ,
  major,
  spercialty,
  academic_year,
});

//file uplode

const title = Joi.string().min(3).max(100).trim().required();
const creation_year = Joi.number().min(2000).max(2025).required();
const type = Joi.string()
  .valid(...type_file)
  .required();
const subject = Joi.string().min(3).max(100).trim().required();

export const shemaUploadFile = Joi.object({
  title,
  univ,
  major,
  academic_year,
  spercialty,
  subject,
  type,
  creation_year,
});
