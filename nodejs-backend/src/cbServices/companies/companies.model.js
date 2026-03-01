module.exports = function (app) {
    const modelName = 'companies';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            name: {
                type: String,
                minLength: 3,
                maxLength: 1000000,
                index: true,
                trim: true,
                comment:
                    'Name, p, false, true, true, true, true, true, true, , , , ,'
            },
            companyNo: {
                type: String,
                required: true,
                index: true,
                trim: true,
                comment:
                    'Company no, p, false, true, true, true, true, true, true, , , , ,'
            },
            newCompanyNumber: {
                type: String,
                unique: true,
                maxLength: 150,
                index: true,
                trim: true,
                comment:
                    'New company number, p, false, true, true, true, true, true, true, , , , ,'
            },
            DateIncorporated: {
                type: Date,
                comment:
                    'Date Incorporated, p_calendar, false, true, true, true, true, true, true, , , , ,'
            },
            isdefault: {
                type: Boolean,
                required: false,
                default: false,
                comment:
                    'Is default, p_boolean, false, true, true, true, true, true, true, , , , ,'
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
