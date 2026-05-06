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

const univ = Joi.string().min(5).max(50).trim().required();
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

//report file
const type_report = [
  'Inappropriate content',
  'COPYRIGHT issuse',
  'Spam or misleading',
  'Incorrect information',
  'Other',
];
const reason = Joi.string()
  .valid(...type_report)
  .required();
const details = Joi.string().min(3).max(500).trim().required();

export const schemaReportFile = Joi.object({
  reason,
  details,
});

//like file
const type_like = ['LIKE', 'DISLIKE'];
export const schemaLikeFile = Joi.object({
  type: Joi.string()
    .valid(...type_like)
    .required(),
});

//study list
const name = Joi.string().min(3).max(100).trim().required();
const description = Joi.string().min(3).max(500).trim().required();

const privacy = Joi.string().valid('public', 'private').required();

export const schemaStudyList = Joi.object({
  name,
  subject,
  description,
  privacy,
});

export const schemaEditStudyList = Joi.object({
  name: name.optional(),
  description: description.optional(),
  privacy: privacy.optional(),
}).min(1);

//reminder
const date = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .required();
const time = Joi.string()
  .pattern(/^([01]\d|2[0-3]):[0-5]\d$/)
  .required();

export const schemaReminder = Joi.object({
  date,
  time,
});
//chat ai
const message = Joi.string().min(1).max(10000).required();
export const schemaChatAi = Joi.object({
  message,
});

//DeleteOrIgnoreReportedFile

// const adminReason = Joi.string().min(3).max(500).trim().when('$action', {
//   is: 'delete',
//   then: Joi.required(),
//   otherwise: Joi.optional(),
// });

// export const schemaAdminReason = Joi.object({
//   reason: adminReason,
// });

//search file

// const year_creation = Joi.number().min(2000).max(2025).required();

// export const schemaSearchFile = Joi.object({
//   title: title.min(1).required(),
//   univ: univ.optional(),
//   major: major.optional(),
//   academic_year: academic_year.optional(),
//   spercialty: spercialty.optional(),
//   type: type.optional(),
//   year_creation: year_creation.optional(),
// });
