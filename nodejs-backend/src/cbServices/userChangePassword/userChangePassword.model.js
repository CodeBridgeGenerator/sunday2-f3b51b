module.exports = function (app) {
    const modelName = 'user_change_password';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            userEmail: {
                type: String,
                required: true,
                comment:
                    'User Email, p, false, true, true, true, true, true, true, , , , ,'
            },
            server: {
                type: String,
                required: true,
                comment:
                    'Server, p, false, true, true, true, true, true, true, , , , ,'
            },
            environment: {
                type: String,
                comment:
                    'Environment, p, false, true, true, true, true, true, true, , , , ,'
            },
            code: {
                type: String,
                required: true,
                comment:
                    'Code, p, false, true, true, true, true, true, true, , , , ,'
            },
            status: {
                type: Boolean,
                required: false,
                comment:
                    'Status, p_boolean, false, true, true, true, true, true, true, , , , ,'
            },
            sendEmailCounter: {
                type: Number,
                max: 1000000,
                comment:
                    'Send Email Counter, p_number, false, true, true, true, true, true, true, , , , ,'
            },
            lastAttempt: {
                type: Date,
                comment:
                    'Last Attempt, calendar_12, false, true, true, true, true, true, true, , , , ,'
            },
            ipAddress: {
                type: String,
                comment:
                    'IP address, p, false, true, true, true, true, true, true, , , , ,'
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
