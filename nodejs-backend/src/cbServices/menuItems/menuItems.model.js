module.exports = function (app) {
    const modelName = 'menu_items';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            userContext: {
                type: Schema.Types.ObjectId,
                ref: 'profile_menu',
                comment:
                    'User Context, dropdown, false, true, true, true, true, true, true, profileMenu, profile_menu, one-to-one, user,'
            },
            menuItems: {
                type: Schema.Types.Mixed,
                comment:
                    'menuItems, pre, false, true, true, true, true, true, true, , , , ,'
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
