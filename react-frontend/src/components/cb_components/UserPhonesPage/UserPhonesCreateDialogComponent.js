import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import client from '../../../services/restClient';
import _ from 'lodash';
import initilization from '../../../utils/init';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { InputMask } from 'primereact/inputmask';
const typeArray = ['Land line', 'Mobile', 'Fax', 'WA Only', 'SMS Only'];
const typeOptions = typeArray.map((x) => ({ name: x, value: x }));
import countries from '../../../resources/countries.json';
import parsePhoneNumber from 'libphonenumber-js';
import { getSchemaValidationErrorsStrings, updateMany } from '../../../utils';

// (possible exports: AsYouType, AsYouTypeCustom, DIGITS, DIGIT_PLACEHOLDER, Metadata, ParseError,
//   PhoneNumberMatcher, PhoneNumberSearch, PhoneNumberSearchCustom, default, findNumbers, findPhoneNumbers, findPhoneNumbersCustom,
// findPhoneNumbersInText, format, formatCustom, formatIncompletePhoneNumber, formatNumber, formatRFC3966, getCountries,
// getCountryCallingCode, getCountryCallingCodeCustom, getExampleNumber, getExtPrefix, getNumberType, getNumberTypeCustom, getPhoneCode,
//   getPhoneCodeCustom, isPossibleNumber, isPossiblePhoneNumber, isSupportedCountry, isValidNumber, isValidNumberCustom,
// isValidNumberForRegion, isValidPhoneNumber, parse, parseCustom, parseDigits, parseIncompletePhoneNumber, parseNumber,
// parsePhoneNumber, parsePhoneNumberCharacter, parsePhoneNumberFromString, parsePhoneNumberWithError, parseRFC3966,
// searchNumbers, searchPhoneNumbers, searchPhoneNumbersCustom, searchPhoneNumbersInText, validatePhoneNumberLength)

const UserPhonesCreateDialogComponent = (props) => {
    const [_entity, set_entity] = useState({});
    const [error, setError] = useState({});
    const [loading, setLoading] = useState(false);
    const urlParams = useParams();
    const [userId, setUserId] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);
    countries.sort((a, b) => a.name.localeCompare(b.name));

    useEffect(() => {
        let init = { isDefault: false };

        if (!_.isEmpty(props?.entity)) {
            init = initilization({ ...props?.entity, ...init }, [userId], setError);
        }
        set_entity({ ...init });
    }, [props.show]);

    useEffect(() => {
        set_entity({});
    }, [props.onHide]);

    const validate = () => {
        let ret = true;
        const error = {};

        if (_.isEmpty(_entity?.number)) {
            error['number'] = `Phone number is required`;
            ret = false;
        }

        if (_.isEmpty(_entity?.userId)) {
            error['userId'] = `User is required`;
            ret = false;
        }

        if (_.isEmpty(_entity?.type)) {
            error['type'] = `Phone type is required`;
            ret = false;
        }

        if (_.isEmpty(_entity?.countryCode)) {
            error['countryCode'] = `Phone Country Code is required`;
            ret = false;
        }

        if (!ret) setError(error);
        return ret;
    };

    const onSave = async () => {
        if (!validate()) return;

        let _data = {
            userId: _entity?.userId?._id,
            countryCode: _entity?.countryCode,
            operatorCode: _entity?.operatorCode,
            number: _entity?.number,
            type: _entity?.type,
            isDefault: _entity?.isDefault || false,
            createdBy: props.user._id,
            updatedBy: props.user._id
        };

        setLoading(true);

        if (_entity?.isDefault) {
            const updated = await updateMany({
                collection: 'user_phones',
                query: {
                    type: _entity?.type,
                    userId: _entity?.userId?._id
                },
                update: { isDefault: false },
                user: props.user
            });
        } else {
            const validResult = await client.service('userPhones').find({
                query: { type: _entity?.type, userId: _entity?.userId?._id }
            });
            if (validResult.total <= 1) _entity.isDefault = true;
        }

        try {
            const result = await client.service('userPhones').create(_data);
            const eagerResult = await client.service('userPhones').find({
                query: {
                    $limit: 10000,
                    _id: { $in: [result._id] },
                    $populate: [
                        {
                            path: 'userId',
                            service: 'users',
                            select: ['name']
                        }
                    ]
                }
            });
            props.onHide();
            props.alert({
                type: 'success',
                title: 'Create info',
                message: 'Info User Phones updated successfully'
            });
            props.onCreateResult(eagerResult.data[0]);
        } catch (error) {
            console.debug('error', error);
            setError(getSchemaValidationErrorsStrings(error) || 'Failed to create');
            props.alert({
                type: 'error',
                title: 'Create',
                message: 'Failed to create in User Phones'
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        // on mount users
        client
            .service('users')
            .find({
                query: {
                    $limit: 10000,
                    $sort: { createdAt: -1 },
                    _id: urlParams.singleUsersId
                }
            })
            .then((res) => {
                setUserId(
                    res.data.map((e) => {
                        return { name: e['name'], value: e._id };
                    })
                );
            })
            .catch((error) => {
                console.debug({ error });
                props.alert({
                    title: 'Users',
                    type: 'error',
                    message: error.message || 'Failed get users'
                });
            });
    }, []);

    const selectedCountryTemplate = (option, props) => {
        if (option) {
            return (
                <div className="flex align-items-center">
                    <img alt={option.name} src={`assets/png100px/${option.code.toLowerCase()}.png`} className={`mr-2 flag flag-${option.code.toLowerCase()}`} style={{ width: '18px' }} />
                    <div>{option.name}</div>
                </div>
            );
        }

        return <span>{props.placeholder}</span>;
    };

    const countryOptionTemplate = (option) => {
        return (
            <div className="flex align-items-center">
                <img alt={option.name} src={`assets/png100px/${option.code.toLowerCase()}.png`} className={`mr-2 flag flag-${option.code.toLowerCase()}`} style={{ width: '18px' }} />
                <div>{option.name}</div>
            </div>
        );
    };

    const setPhoneNumber = (number) => {
        setError({});
        const phoneNumber = parsePhoneNumber(number, selectedCountry.code.toUpperCase());

        if (phoneNumber && phoneNumber.isPossible()) {
            set_entity({
                countryCode: phoneNumber?.countryCallingCode,
                operatorCode: number.substring(1, 3),
                number: phoneNumber?.number
            });
        } else {
            props.alert({
                title: 'Phone Number',
                type: 'error',
                message: 'Phone invalid'
            });
            if (phoneNumber && !phoneNumber.isValid()) {
                error['number'] = `Phone number is required`;
                setError(error);
            }
        }
    };

    const renderFooter = () => (
        <div className="flex justify-content-end">
            <Button label="save" className="p-button-text no-focus-effect" onClick={onSave} loading={loading} />
            <Button label="close" className="p-button-text no-focus-effect p-button-secondary" onClick={props.onHide} />
        </div>
    );

    const setValByKey = (key, val) => {
        let new_entity = { ..._entity, [key]: val };
        set_entity(new_entity);
        setError({});
    };

    const userIdOptions = userId.map((elem) => ({
        name: elem.name,
        value: elem.value
    }));

    return (
        <Dialog header="Add User Phone" visible={props.show} closable={false} onHide={props.onHide} modal style={{ width: '40vw' }} className="min-w-max" footer={renderFooter()} resizable={false}>
            <div className="grid p-fluid overflow-y-auto" style={{ maxWidth: '55vw' }} role="userPhones-create-dialog-component">
                <div className="col-12 field">
                    <span className="align-items-center">
                        <label htmlFor="userId">User:</label>
                        <Dropdown id="userId" value={_entity?.userId?._id} optionLabel="name" optionValue="value" options={userIdOptions} onChange={(e) => setValByKey('userId', { _id: e.value })} />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['userId']) ? (
                            <p className="m-0" key="error-userId">
                                {error['userId']}
                            </p>
                        ) : null}
                    </small>
                </div>

                <div className="col-4">
                    <span className="align-items-center">
                        <label htmlFor="country" className="font-bold block mb-2">
                            Country:
                        </label>
                        <Dropdown
                            id="country"
                            key="country"
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.value)}
                            options={countries}
                            optionLabel="name"
                            placeholder="Select a Country"
                            filter
                            valueTemplate={selectedCountryTemplate}
                            itemTemplate={countryOptionTemplate}
                            className="w-full md:w-14rem"
                        />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['countryCode']) ? (
                            <p className="m-0" key="error-countryCode">
                                {error['countryCode']}
                            </p>
                        ) : null}
                    </small>
                </div>

                <div className="col-6 field">
                    <span className="align-items-center">
                        <label htmlFor="phone" className="font-bold block mb-2">
                            Enter Phone:
                        </label>
                        <InputMask id="phone" mask="(99) 999 - 9999?" placeholder="+(99) 999 - 99999" onComplete={(e) => setPhoneNumber(e.value)}></InputMask>
                    </span>
                </div>

                <div className="col-12 md:col-4 field">
                    <span className="align-items-center">
                        <label htmlFor="type">Type:</label>
                        <Dropdown id="type" value={_entity?.type} options={typeOptions} optionLabel="name" optionValue="value" onChange={(e) => setValByKey('type', e.value)} />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['type']) ? (
                            <p className="m-0" key="error-type">
                                {error['type']}
                            </p>
                        ) : null}
                    </small>
                </div>
                <div className="col-12 md:col-6 field">
                    <span className="align-items-center">
                        <label htmlFor="number">Dailing Number:</label>
                        <InputText id="number" className="w-full mb-3 p-inputtext-sm" value={_entity?.number} disabled={true} />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['number']) ? (
                            <p className="m-0" key="error-countryCode">
                                {error['number']}
                            </p>
                        ) : null}
                    </small>
                </div>

                <div className="col-12 md:col-2 field flex">
                    <span className="align-items-center mt-5">
                        <label htmlFor="isDefault">Is Default:</label>
                        <Checkbox id="isDefault" className="ml-3" checked={_entity?.isDefault} onChange={(e) => setValByKey('isDefault', e.checked)} />
                    </span>
                </div>
            </div>
        </Dialog>
    );
};

const mapState = (state) => {
    const { user } = state.auth;
    return { user };
};
const mapDispatch = (dispatch) => ({
    alert: (data) => dispatch.toast.alert(data),
    hasServicePermission: (service) => dispatch.perms.hasServicePermission(service),
    hasServiceFieldsPermission: (service) => dispatch.perms.hasServiceFieldsPermission(service)
});

export default connect(mapState, mapDispatch)(UserPhonesCreateDialogComponent);
