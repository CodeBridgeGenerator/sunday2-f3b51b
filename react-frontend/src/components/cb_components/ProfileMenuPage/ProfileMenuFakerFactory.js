import { faker } from '@faker-js/faker';
export default (user, count, userIds) => {
    let data = [];
    for (let i = 0; i < count; i++) {
        const fake = {
            role: faker.lorem.sentence(''),
            position: faker.lorem.sentence(''),
            profile: faker.lorem.sentence(''),
            user: userIds[i % userIds.length],
            company: faker.lorem.sentence(''),
            branch: faker.lorem.sentence(''),
            department: faker.lorem.sentence(''),
            section: faker.lorem.sentence(''),

            updatedBy: user._id,
            createdBy: user._id
        };
        data = [...data, fake];
    }
    return data;
};
