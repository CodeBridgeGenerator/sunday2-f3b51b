module.exports = {
    after: {
        create(context) {
            if (Array.isArray(context.result) && context.result.length > 1) {
                return context;
            }
            createNotification(context, 'created', context.result);
            return context;
        },
        update(context) {
            if (Array.isArray(context.result) && context.result.length > 1) {
                return context;
            }
            createNotification(context, 'updated', context.result);
            return context;
        },
        patch(context) {
            if (Array.isArray(context.result) && context.result.length > 1) {
                return context;
            }
            createNotification(context, 'updated', context.result);
            return context;
        },
        remove(context) {
            if (Array.isArray(context.result) && context.result.length > 1) {
                return context;
            }

            if (context.result && context.result.deletedCount > 1) {
                return context;
            }

            if (!Array.isArray(context.result)) {
                createNotification(context, 'removed', context.result);
            }
            return context;
        }
    }
};

function createNotification(context, action, result = null) {
    const { app, params } = context;

    if (
        context.path === 'notifications' ||
        context.path === 'authentication' ||
        context.path === 'audits' ||
        context.path === 'documentStorages' ||
        context.path === 'mailQues' ||
        context.path === 'userInvites' ||
        context.path === 'loginHistory' ||
        context.path === 'users' ||
        context.path === 'profiles' ||
        context.path === 'userChangePassword' ||
        context.path === 'companies' ||
        context.path === 'branches' ||
        context.path === 'roles' ||
        context.path === 'positions' ||
        context.path === 'forgotPassword'
    ) {
        return context;
    }

    const recordId = result && result._id ? result._id : null;

    if (!recordId) {
        return context;
    }

    // const userId = params.user ? params.user._id : "unknown";

    const notificationData = {
        toUser: params.user._id,
        content: `${context.path} with id ${recordId} was ${action}`,
        read: false,
        sent: new Date(),
        createdBy:
            params && params.user && typeof params.user._id !== 'undefined'
                ? params.user._id
                : null,
        updatedBy:
            params && params.user && typeof params.user._id !== 'undefined'
                ? params.user._id
                : null,
        path: `${context.path}`,
        recordId: recordId
    };

    try {
        app.service('notifications').create(notificationData);
    } catch (error) {
        console.error('Error creating notification:', error);
    }
}
