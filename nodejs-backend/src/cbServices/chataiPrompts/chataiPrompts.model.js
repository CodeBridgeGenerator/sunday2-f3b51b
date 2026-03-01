module.exports = function (app) {
    const modelName = 'chatai_prompts';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            session: {
                type: String,
                comment:
                    'Session, p, false, true, true, true, true, true, true, , , , ,'
            },
            chatAiEnabler: {
                type: Schema.Types.ObjectId,
                ref: 'chatai_enabler',
                comment:
                    'Chat AI Enabler, dropdown, false, true, true, true, true, true, true, chataiEnabler, chatai_enabler, one-to-one, name,'
            },
            chatAiConfig: {
                type: Schema.Types.ObjectId,
                ref: 'chatai_config',
                comment:
                    'Chat Ai Config, dropdown, false, true, true, true, true, true, true, chataiConfig, chatai_config, one-to-one, name,'
            },
            prompt: {
                type: String,
                comment:
                    'Prompt, editor, false, true, true, true, true, true, true, , , , ,'
            },
            refDocs: {
                type: [Schema.Types.ObjectId],
                ref: 'document_storages',
                comment:
                    'Ref Docs, file_upload, false, true, true, true, true, true, true, , , , ,'
            },
            responseText: {
                type: String,
                comment:
                    'Response Text, inputTextarea, false, true, true, true, true, true, true, , , , ,'
            },
            systemId: {
                type: String,
                comment:
                    'System Id, p, false, true, true, true, true, true, true, , , , ,'
            },
            type: {
                type: String,
                comment:
                    'Type, p, false, true, true, true, true, true, true, , , , ,'
            },
            role: {
                type: String,
                comment:
                    'Role, p, false, true, true, true, true, true, true, , , , ,'
            },
            model: {
                type: String,
                comment:
                    'Model, p, false, true, true, true, true, true, true, , , , ,'
            },
            params: {
                type: String,
                comment:
                    'Params, inputTextarea, false, true, true, true, true, true, true, , , , ,'
            },
            stopReason: {
                type: String,
                comment:
                    'Stop Reason, inputTextarea, false, true, true, true, true, true, true, , , , ,'
            },
            stopSequence: {
                type: String,
                comment:
                    'Stop Sequence, inputTextarea, false, true, true, true, true, true, true, , , , ,'
            },
            inputTokens: {
                type: Number,
                max: 1000000,
                comment:
                    'Input Tokens, p_number, false, true, true, true, true, true, true, , , , ,'
            },
            outputTokens: {
                type: Number,
                max: 1000000,
                comment:
                    'Output Tokens, p_number, false, true, true, true, true, true, true, , , , ,'
            },
            cost: {
                type: Number,
                max: 1000000,
                comment:
                    'Cost, currency, false, true, true, true, true, true, true, , , , ,'
            },
            status: {
                type: Boolean,
                required: false,
                default: false,
                comment:
                    'Status, p_boolean, false, true, true, true, true, true, true, , , , ,'
            },
            error: {
                type: String,
                comment:
                    'Error, inputTextarea, false, true, true, true, true, true, true, , , , ,'
            },
            userRemarks: {
                type: String,
                comment:
                    'User Remarks, inputTextarea, false, true, true, true, true, true, true, , , , ,'
            },
            thumbsDown: {
                type: Boolean,
                required: false,
                default: false,
                comment:
                    'Thumbs Down, p_boolean, false, true, true, true, true, true, true, , , , ,'
            },
            thumbsUp: {
                type: Boolean,
                required: false,
                comment:
                    'Thumbs Up, p_boolean, false, true, true, true, true, true, true, , , , ,'
            },
            copies: {
                type: Boolean,
                required: false,
                default: false,
                comment:
                    'Copies, p_boolean, false, true, true, true, true, true, true, , , , ,'
            },
            emailed: {
                type: Boolean,
                required: false,
                default: false,
                comment:
                    'Emailed, p_boolean, false, true, true, true, true, true, true, , , , ,'
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
