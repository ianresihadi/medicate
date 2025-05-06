import * as Joi from "joi";

const configValidationSchema = Joi.object({
  ENV: Joi.required().valid("development", "production", "test"),
  PORT: Joi.number().required(),
  APP_NAME: Joi.string().required(),
  APP_URL: Joi.string().required(),

  DB_DRIVER: Joi.required().valid("mysql", "mariadb"),
  DB_HOST: Joi.required(),
  DB_PORT: Joi.number().required(),
  DB_NAME: Joi.string().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),

  JWT_SECRET_KEY: Joi.string().required(),

  QONTAK_URL: Joi.string().required(),
  QONTAK_USERNAME: Joi.string().required(),
  QONTAK_PASSWORD: Joi.string().required(),
  QONTAK_CLIENT_ID: Joi.string().required(),
  QONTAK_CLIENT_SECRET: Joi.string().required(),
  QONTAK_DEVELOPMENT_TOKEN: Joi.string().required(),
  QONTAK_CERTIFICATE_TEMPLATE_ID: Joi.string().required(),
  QONTAK_CHANNEL_INTEGRATION_ID: Joi.string().required(),
});

export { configValidationSchema };
