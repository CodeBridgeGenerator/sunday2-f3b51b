module.exports = function (app) {
    const modelName = 'login_histories';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'users',
                comment:
                    'UserId, dropdown, false, true, true, true, true, true, true, users, users, one-to-one, name,'
            },
            device: {
                type: String,
                comment:
                    'Device, p, false, true, true, true, true, true, true, , , , ,'
            },
            browser: {
                type: String,
                comment:
                    'Browser, p, false, true, true, true, true, true, true, , , , ,'
            },
            userAgent: {
                type: String,
                comment:
                    'User Agent, p, false, true, true, true, true, true, true, , , , ,'
            },
            loginTime: {
                type: Date,
                comment:
                    'loginTime, calendar_12, false, true, true, true, true, true, true, , , , ,'
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
