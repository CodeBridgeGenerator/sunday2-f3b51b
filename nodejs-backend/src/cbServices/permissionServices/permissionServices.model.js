module.exports = function (app) {
    const modelName = 'permission_services';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            service: {
                type: String,
                required: true,
                index: true,
                trim: true,
                comment:
                    'Service, p, false, true, true, true, true, true, true, , , , ,'
            },
            create: {
                type: Boolean,
                required: false,
                default: false,
                comment:
                    'create, tick, false, true, true, true, true, true, true, , , , ,'
            },
            read: {
                type: Boolean,
                required: false,
                default: false,
                comment:
                    'read, tick, false, true, true, true, true, true, true, , , , ,'
            },
            update: {
                type: Boolean,
                required: false,
                default: false,
                comment:
                    'update, tick, false, true, true, true, true, true, true, , , , ,'
            },
            delete: {
                type: Boolean,
                required: false,
                default: false,
                comment:
                    'delete, tick, false, true, true, true, true, true, true, , , , ,'
            },
            import: {
                type: Boolean,
                required: false,
                default: false,
                comment:
                    'import, tick, false, true, true, true, true, true, true, , , , ,'
            },
            export: {
                type: Boolean,
                required: false,
                comment:
                    'export, tick, false, true, true, true, true, true, true, , , , ,'
            },
            seeder: {
                type: Boolean,
                required: false,
                default: false,
                comment:
                    'seeder, tick, false, true, true, true, true, true, true, , , , ,'
            },
            userId: {
                type: Schema.Types.ObjectId,
                ref: 'users',
                comment:
                    'User Id, dropdown, false, true, true, true, true, true, true, users, users, one-to-one, name,'
            },
            roleId: {
                type: Schema.Types.ObjectId,
                ref: 'roles',
                comment:
                    'Role Id, dropdown, false, true, true, true, true, true, true, roles, roles, one-to-one, name,'
            },
            profile: {
                type: Schema.Types.ObjectId,
                ref: 'profiles',
                comment:
                    'Profile, dropdown, false, true, true, true, true, true, true, profiles, profiles, one-to-one, name,'
            },
            positionId: {
                type: Schema.Types.ObjectId,
                ref: 'positions',
                comment:
                    'Position Id, dropdown, false, true, true, true, true, true, true, positions, positions, one-to-one, name,'
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
