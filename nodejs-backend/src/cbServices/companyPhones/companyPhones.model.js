module.exports = function (app) {
    const modelName = 'company_phones';
    const mongooseClient = app.get('mongooseClient');
    const { Schema } = mongooseClient;
    const schema = new Schema(
        {
            companyId: {
                type: Schema.Types.ObjectId,
                ref: 'companies',
                comment:
                    'Company, dropdown, true, true, true, true, true, true, true, companies, companies, one-to-one, name,'
            },
            countryCode: {
                type: Number,
                max: 100000000,
                comment:
                    'Country code, default, false, true, true, true, true, true, true, , , , ,'
            },
            operatorCode: {
                type: Number,
                max: 100000000,
                comment:
                    'Operator code, default, false, true, true, true, true, true, true, , , , ,'
            },
            number: {
                type: Number,
                max: 100000000,
                comment:
                    'Number, default, false, true, true, true, true, true, true, , , , ,'
            },
            type: {
                type: String,
                enum: ['Land line', 'Mobile', 'Fax'],
                comment:
                    'Type, dropdownArray, true, true, true, true, true, true, true, , , , ,'
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
