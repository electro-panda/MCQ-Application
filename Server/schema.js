const BaseJoi = require("joi")

const SanitizeHtml = require('sanitize-html');

const extension = (joi) => {
    return {

        type: 'string',
        base: joi.string(),
        messages: {
            'string.escapeHTML': '{{#label}} must not include HTML!'
        },
        rules: {
            escapeHTML: {

                validate(value, helpers) {
                    const clean = SanitizeHtml(value, {
                        allowedTags: [],
                        allowedAttributes: {},
                    });
                    if (clean !== value) return helpers.error('string.escapeHTML', { value });
                    return clean;
                },
            },
        },
    };
};

const Joi = BaseJoi.extend(extension);

module.exports.testSchema = Joi.object({
    test: Joi.object({
        title: Joi.string().escapeHTML().required(),
        timestamp: Joi.number().required().min(1),
        questions: Joi.array().items(
            Joi.object({
                questionText: Joi.string().escapeHTML().required(),
                options: Joi.array().items(
                    Joi.string().escapeHTML().required()
                ).length(4).required(),
                correctAnswer: Joi.string().escapeHTML().required()
            })
        ).required()
    }).required()
}).required()

module.exports.resultSchema = Joi.object({
    answers: Joi.array().items(
        Joi.object({
            questionId: Joi.string().required(),
            selectedOption: Joi.string().escapeHTML().allow("").required()
        })
    ).required()
}).required();

