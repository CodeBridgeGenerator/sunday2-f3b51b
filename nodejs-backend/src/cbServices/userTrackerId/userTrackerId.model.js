module.exports = function (app) {
    const modelName = 'user_tracker_id';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            pageName: {
                type: String,
                required: true,
                comment:
                    'Page Name, p, false, true, true, true, true, true, true, , , , ,'
            },
            trackerCode: {
                type: String,
                comment:
                    'TrackerCode, p, false, true, true, true, true, true, true, , , , ,'
            },
            userAgent: {
                type: String,
                comment:
                    'User Agent, p, false, true, true, true, true, true, true, , , , ,'
            },
            language: {
                type: String,
                comment:
                    'Language, p, false, true, true, true, true, true, true, , , , ,'
            },
            timeZone: {
                type: String,
                comment:
                    'Time Zone, p, false, true, true, true, true, true, true, , , , ,'
            },
            cookeisEnabled: {
                type: String,
                comment:
                    'Cookeis Enabled, p, false, true, true, true, true, true, true, , , , ,'
            },
            doNotTrack: {
                type: String,
                comment:
                    'Do Not Track, p, false, true, true, true, true, true, true, , , , ,'
            },
            hardConcurrency: {
                type: String,
                comment:
                    'Hard Concurrency, p, false, true, true, true, true, true, true, , , , ,'
            },
            marketCode: {
                type: String,
                comment:
                    'Market Code, p, false, true, true, true, true, true, true, , , , ,'
            },
            isLoggedIn: {
                type: Boolean,
                required: false,
                comment:
                    'Is logged In, p_boolean, false, true, true, true, true, true, true, , , , ,'
            },
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'users',
                comment:
                    'User Id, dropdown, false, true, true, true, true, true, true, users, users, one-to-one, name,'
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
