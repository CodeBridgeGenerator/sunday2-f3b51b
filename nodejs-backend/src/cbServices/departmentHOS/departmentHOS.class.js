const { Service } = require('feathers-mongoose');
const FindService = require('../../utils/abstracts/FindService');
const MixedService = FindService(Service);

exports.DepartmentHOS = class DepartmentHOS extends MixedService {};
