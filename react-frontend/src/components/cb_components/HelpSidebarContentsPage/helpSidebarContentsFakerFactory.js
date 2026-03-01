import { faker } from '@faker-js/faker';
export default (user, count) => {
    let data = [];
    for (let i = 0; i < count; i++) {
        const fake = {
            serviceName: faker.lorem.sentence(''),
            purpose: faker.lorem.sentence(''),
            path: faker.lorem.sentence(''),
            features: faker.lorem.sentence(''),
            guide: faker.lorem.sentence(''),
            content: faker.lorem.sentence(''),

            updatedBy: user._id,
            createdBy: user._id
        };
        data = [...data, fake];
    }
    return data;
};
