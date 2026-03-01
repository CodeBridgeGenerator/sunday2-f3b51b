module.exports = {
    before: {
        update: async (context) => {
            await createAuditLog(context, 'update');
            return context;
        },
        patch: async (context) => {
            await createAuditLog(context, 'patch');
            return context;
        },
        remove: async (context) => {
            await createAuditLog(context, 'remove');
            return context;
        }
    },
    after: {
        update: async (context) => {
            await createAuditLog(context, 'update', context.result);
            return context;
        },
        patch: async (context) => {
            await createAuditLog(context, 'patch', context.result);
            return context;
        },
        remove: async (context) => {
            await createAuditLog(context, 'remove', context.result);
            return context;
        }
    },
    error: {}
};

async function createAuditLog(context, action, result = null) {
    // console.log(context);
    const { app, method, params, data, path } = context;

    if (!params.user || !params.user._id) {
        return;
    }

    try {
        const user = await app.service('users').get(params.user._id);

        if (!user) {
            return;
        }

        const auditData = {
            action,
            createdBy: user._id,
            serviceName: path,
            method,
            details: JSON.stringify(data || result || {})
        };

        await app.service('audits').create(auditData);
    } catch (error) {
        console.error('Error creating audit log:', error);
    }
}
