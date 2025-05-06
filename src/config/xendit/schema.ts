import * as Joi from "joi";

export default Joi.object({
    XENDIT_SECRET_KEY: Joi.string().optional(),
    XENDIT_WEBHOOK_TOKEN: Joi.string().optional(),
});
