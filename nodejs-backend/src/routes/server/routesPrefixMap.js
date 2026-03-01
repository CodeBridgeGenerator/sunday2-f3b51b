// routesPrefixMap.js
const CB_ADMIN_SERVICES = new Set([
    'users',
    'companies',
    'branches',
    'departments',
    'sections',
    'roles',
    'positions',
    'profiles',
    'templates',
    'mails',
    'permissionServices',
    'permissionFields',
    'userAddresses',
    'companyAddresses',
    'companyPhones',
    'userPhones',
    'userInvites',
    'employees',
    'superiors',
    'staffinfo',
    'dynaLoader',
    'dynaFields',
    'mailQues',
    'jobQues',
    'profileMenu',
    'prompts',
    'inbox',
    'notifications',
    'documentStorages',
    'errorLogs',
    'userChangePassword',
    'loginHistory',
    'departmentAdmin',
    'departmentHOD',
    'departmentHOS',
    'errorsWH',
    'fcm',
    'mailWH',
    'userGuide',
    'uploader'
]);

function getRouteBase(serviceName) {
    // Decide default routing base
    if (CB_ADMIN_SERVICES.has(serviceName)) return '/cbAdmin';
    return '/app'; // fallback for app pages
}

module.exports = { getRouteBase, CB_ADMIN_SERVICES };
