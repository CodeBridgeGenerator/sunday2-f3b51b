module.exports = function (app) {
    const modelName = 'company_addresses';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            company: {
                type: Schema.Types.ObjectId,
                ref: 'companies',
                comment:
                    'Company, dropdown, true, true, true, true, true, true, true, companies, companies, one-to-one, name,'
            },
            street1: {
                type: String,
                minLength: 3,
                maxLength: 100000000,
                index: true,
                trim: true,
                comment:
                    'Street 1, inputTextarea, false, true, true, true, true, true, true, , , , ,'
            },
            street2: {
                type: String,
                minLength: 3,
                maxLength: 100000000,
                index: true,
                trim: true,
                comment:
                    'Street 2, inputTextarea, false, true, true, true, true, true, true, , , , ,'
            },
            poscode: {
                type: String,
                maxLength: 100000000,
                index: true,
                trim: true,
                comment:
                    'Poscode, p, false, true, true, true, true, true, true, , , , ,'
            },
            city: {
                type: String,
                minLength: 3,
                maxLength: 100000000,
                index: true,
                trim: true,
                comment:
                    'City, p, false, true, true, true, true, true, true, , , , ,'
            },
            state: {
                type: String,
                minLength: 3,
                maxLength: 100000000,
                index: true,
                trim: true,
                comment:
                    'State, p, false, true, true, true, true, true, true, , , , ,'
            },
            province: {
                type: String,
                minLength: 3,
                maxLength: 100000000,
                index: true,
                trim: true,
                comment:
                    'Province, p, false, true, true, true, true, true, true, , , , ,'
            },
            country: {
                type: String,
                minLength: 3,
                maxLength: 100000000,
                index: true,
                trim: true,
                comment:
                    'Country, p, false, true, true, true, true, true, true, , , , ,'
            },
            isDefault: {
                type: Boolean,
                required: false,
                default: false,
                comment:
                    'Is Default, p_boolean, false, true, true, true, true, true, true, , , , ,'
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
