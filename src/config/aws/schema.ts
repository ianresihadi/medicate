import * as Joi from "joi";

export default Joi.object({
  AWS_ACCESS_KEY_ID: Joi.string().optional(),
  AWS_SECRET_ACCESS_KEY: Joi.string().optional(),
  AWS_BUCKET: Joi.string().optional(),
  AWS_DEFAULT_REGION: Joi.string().optional(),
  AWS_BUCKET_URL: Joi.string().optional(),
});
