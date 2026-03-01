module.exports = function (app) {
    const modelName = 'inbox';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            from: {
                type: Schema.Types.ObjectId,
                ref: 'users',
                comment:
                    'From, dropdown, false, true, true, true, true, true, true, users, users, one-to-one, name,'
            },
            toUser: {
                type: Schema.Types.ObjectId,
                ref: 'users',
                comment:
                    'To User, dropdown, false, true, true, true, true, true, true, users, users, one-to-one, name,'
            },
            subject: {
                type: String,
                comment:
                    'Subject, p, false, true, true, true, true, true, true, , , , ,'
            },
            content: {
                type: String,
                comment:
                    'Content, editor, false, true, true, true, true, true, true, , , , ,'
            },
            service: {
                type: String,
                comment:
                    'Service, p, false, true, true, true, true, true, true, , , , ,'
            },
            read: {
                type: Boolean,
                required: false,
                default: false,
                comment:
                    'Read, tick, false, true, true, true, true, true, true, , , , ,'
            },
            flagged: {
                type: Boolean,
                required: false,
                default: false,
                comment:
                    'Flagged, tick, false, true, true, true, true, true, true, , , , ,'
            },
            sent: {
                type: Boolean,
                required: false,
                default: false,
                comment:
                    'Sent, tick, false, true, true, true, true, true, true, , , , ,'
            },
            links: {
                type: Schema.Types.Mixed,
                comment:
                    'Links, pre, false, true, true, true, true, true, true, , , , ,'
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
