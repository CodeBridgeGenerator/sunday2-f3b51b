module.exports = function (app) {
    const modelName = 'users';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            name: {
                type: String,
                minLength: 2,
                maxLength: 1500,
                index: true,
                trim: true,
                comment:
                    'Name, p, false, true, true, true, true, true, true, , , , ,'
            },
            email: {
                type: String,
                required: true,
                comment:
                    'Email, p, false, true, true, true, true, true, true, , , , ,'
            },
            password: {
                type: String,
                required: true,
                maxLength: 60,
                comment:
                    'Password, p, false, true, true, true, true, true, true, , , , ,'
            },
            status: {
                type: Boolean,
                required: false,
                default: false,
                comment:
                    'Status, p_boolean, false, true, true, true, true, true, true, , , , ,'
            },
            is_email_verified: {
                type: Boolean,
                required: false,
                default: false,
                comment:
                    'Is Email Verified, tick, false, true, true, true, true, true, true, , , , ,'
            },
            remember_token: {
                type: Boolean,
                required: false,
                default: false,
                comment:
                    'Remember Token, tick, false, true, true, true, true, true, true, , , , ,'
            },
            email_verified_at: {
                type: Boolean,
                required: false,
                default: false,
                comment:
                    'Email Verified At, tick, false, true, true, true, true, true, true, , , , ,'
            },
            failedLoginAttempts: {
                type: Number,
                default: 0
            },
            accountLockedUntil: {
                type: Date
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
