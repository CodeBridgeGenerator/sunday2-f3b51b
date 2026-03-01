module.exports = function (app) {
    const modelName = 'profile_menu';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'users',
                comment:
                    'user, dropdown, false, true, true, true, true, true, true, users, users, one-to-one, name,'
            },
            roles: {
                type: [Schema.Types.ObjectId],
                ref: 'roles',
                description: 'isArray',
                comment:
                    'roles, multiselect, false, true, true, true, true, true, true, roles, roles, one-to-many, name,'
            },
            positions: {
                type: [Schema.Types.ObjectId],
                ref: 'positions',
                description: 'isArray',
                comment:
                    'positions, multiselect, false, true, true, true, true, true, true, positions, positions, one-to-many, name,'
            },
            profiles: {
                type: [Schema.Types.ObjectId],
                ref: 'profiles',
                description: 'isArray',
                comment:
                    'profiles, multiselect, false, true, true, true, true, true, true, profiles, profiles, one-to-many, name,'
            },
            menuItems: {
                type: Schema.Types.Mixed,
                comment:
                    'Menu Items, p, false, true, true, true, true, true, true, , , , ,'
            },
            company: {
                type: Schema.Types.ObjectId,
                ref: 'companies',
                comment:
                    'company, dropdown, false, true, true, true, true, true, true, companies, companies, one-to-one, name,'
            },
            branch: {
                type: Schema.Types.ObjectId,
                ref: 'branches',
                comment:
                    'branch, dropdown, false, true, true, true, true, true, true, branches, branches, one-to-one, name,'
            },
            section: {
                type: Schema.Types.ObjectId,
                ref: 'sections',
                comment:
                    'section, dropdown, false, true, true, true, true, true, true, sections, sections, one-to-one, name,'
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
