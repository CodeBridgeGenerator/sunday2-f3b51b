import { faker } from '@faker-js/faker';
export default (user, count, companyIdsIds) => {
    let data = [];
    for (let i = 0; i < count; i++) {
        const fake = {
            companyIds: companyIdsIds[i % companyIdsIds.length],
            name: faker.lorem.sentence(''),
            code: faker.lorem.sentence('8'),
            isDefault: faker.datatype.boolean(),

            updatedBy: user._id,
            createdBy: user._id
        };
        data = [...data, fake];
    }
    return data;
};
