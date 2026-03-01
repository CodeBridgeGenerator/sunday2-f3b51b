async function distinct(request, response) {
    const mongooseClient = request.appInstance.get('mongooseClient');
    const collection = request.body.collection;
    const fieldName = request.body.fieldName;
    if (!collection)
        return response.status(500).json({ err: 'collection undefined' });
    if (!fieldName)
        return response.status(500).json({ err: 'fielName undefined' });
    try {
        const result = await mongooseClient.connection
            .collection(collection)
            .distinct(fieldName, {});
        console.log(collection, fieldName, result);

        return response.status(200).json({ data: result });
    } catch (err) {
        console.debug(err);
        return response.status(500).json({
            err: err.message
        });
    }
}

async function drop(request, response) {
    const mongooseClient = request.appInstance.get('mongooseClient');
    const collection = request.body.collection;
    if (!collection)
        return response.status(500).json({ err: 'collection undefined' });
    try {
        const result = await mongooseClient.model(collection).drop();
        return response.status(200).json({ data: result });
    } catch (err) {
        console.debug(err);
        return response.status(500).json({ err: err.message });
    }
}

// updateMany
async function updateMany(request, response) {
    const mongooseClient = request.appInstance.get('mongooseClient');
    const collection = request.body.collection;
    const query =
        typeof request.body.query === 'string'
            ? JSON.parse(request.body.query)
            : request.body.query;
    const update =
        typeof request.body.update === 'string'
            ? JSON.parse(request.body.update)
            : request.body.update;

    if (!collection)
        return response.status(500).json({ err: 'collection undefined' });
    if (!query) return response.status(500).json({ err: 'query undefined' });
    if (!update)
        return response.status(500).json({ err: 'to update undefined' });
    // console.log("Updating collection:", collection, "Query:", query, "Update:", update);

    try {
        const result = await mongooseClient
            .model(collection)
            .updateMany(query, { $set: update });
        return response.status(200).json({ data: result });
    } catch (err) {
        console.debug(err);
        return response.status(500).json({ err: err.message });
    }
}

// deleteMany
async function deleteMany(request, response) {
    const mongooseClient = request.appInstance.get('mongooseClient');
    const collection = request.body.collection;
    const query = request.body.query;
    const update = request.body.update;
    if (!collection)
        return response.status(500).json({ err: 'collection undefined' });
    if (!query) return response.status(500).json({ err: 'query undefined' });
    if (!update)
        return response.status(500).json({ err: 'to update undefined' });

    try {
        const result = await mongooseClient
            .model(collection)
            .deleteMany(query, { $set: update });
        return response.status(200).json({ data: result });
    } catch (err) {
        console.debug(err);
        return response.status(500).json({ err: err.message });
    }
}

// dump
// restore

module.exports = {
    distinct,
    drop,
    updateMany,
    deleteMany
};
