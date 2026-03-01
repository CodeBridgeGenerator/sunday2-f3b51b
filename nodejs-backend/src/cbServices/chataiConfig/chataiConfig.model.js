module.exports = function (app) {
    const modelName = 'chatai_config';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            name: {
                type: String,
                comment:
                    'Name, p, false, true, true, true, true, true, true, , , , ,'
            },
            chatAiEnabler: {
                type: Schema.Types.ObjectId,
                ref: 'chatai_enabler',
                comment:
                    'Chat Ai Enabler, dropdown, false, true, true, true, true, true, true, chataiEnabler, chatai_enabler, one-to-one, name,'
            },
            bedrockModelId: {
                type: String,
                comment:
                    'Bedrock Model Id, p, false, true, true, true, true, true, true, , , , ,'
            },
            modelParamsJson: {
                type: String,
                comment:
                    'Model Params Json, p, false, true, true, true, true, true, true, , , , ,'
            },
            human: {
                type: String,
                comment:
                    'Human, p, false, true, true, true, true, true, true, , , , ,'
            },
            task: {
                type: String,
                comment:
                    'Task, p, false, true, true, true, true, true, true, , , , ,'
            },
            noCondition: {
                type: String,
                comment:
                    'No Condition, p, false, true, true, true, true, true, true, , , , ,'
            },
            yesCondition: {
                type: String,
                comment:
                    'Yes Condition, p, false, true, true, true, true, true, true, , , , ,'
            },
            documents: {
                type: String,
                comment:
                    'Documents, p, false, true, true, true, true, true, true, , , , ,'
            },
            example: {
                type: String,
                comment:
                    'Example, p, false, true, true, true, true, true, true, , , , ,'
            },
            preamble: {
                type: String,
                comment:
                    'Preamble, p, false, true, true, true, true, true, true, , , , ,'
            },

            createdBy: {
                type: Schema.Types.ObjectId,
                ref: 'users',
                required: true
            },
            updatedBy: {
                type: Schema.Types.ObjectId,
                ref: 'users',
                required: true
            }
        },
        {
            timestamps: true
        }
    );

    if (mongooseClient.modelNames().includes(modelName)) {
        mongooseClient.deleteModel(modelName);
    }
    return mongooseClient.model(modelName, schema);
};
