import { classNames } from 'primereact/utils';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Link } from 'react-router-dom';
import React, { useEffect, useState, useRef } from 'react';
const EnterDetailsStep = (props) => {
    const { email, setEmail, emailError, setEmailError, isVerified, name, setName, nameError, setNameError, onNext, loading, isEmail, setEmailOrStaffId } = props;
    // const [isEmail, setEmailOrStaffId] = useState(true);

    const onEnter = (e) => {
        if (e.key === 'Enter') {
            onNext();
        }
    };

    const allowWebUserSignUp = process.env.REACT_APP_USE_USER_INVITE_SIGNUP ? process.env.REACT_APP_USE_USER_INVITE_SIGNUP === 'true' : false;

    return (
        <div className="w-full max-w-[400px]">
            <div className="px-3 text-center">
                <h3 className="font-semibold">Set up your account</h3>
                <p>Please enter your name and registered email to proceed.</p>
            </div>
            <div className="mt-5">
                <div className="w-full">
                    <p className="m-0">Name</p>
                    <InputText
                        type="text"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            setNameError(null);
                        }}
                        // disabled={isVerified}
                        className={classNames(nameError ? 'p-invalid' : '', 'w-full')}
                        onKeyDown={onEnter}
                    ></InputText>
                    <small className="p-error">{nameError}</small>
                </div>
                <div className="w-full mt-5 mb-3">
                    <p className="m-0">{isEmail ? 'Email' : 'Staff Id'}</p>
                    <InputText
                        className={classNames(emailError ? 'p-invalid' : '', 'w-full')}
                        type="text"
                        placeholder={isEmail ? 'Enter your email' : 'Enter your Staff Id'}
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setEmailError(null);
                        }}
                        onKeyDown={onEnter}
                    />
                    <small className="p-error">{emailError}</small>
                </div>
                <Link onClick={() => setEmailOrStaffId((prev) => !prev)} className="m-0 text-sm font-semibold cursor-pointer !text-link">
                    Sign up with {isEmail ? 'Staff Id' : 'Email'}
                </Link>
            </div>
            <div className="flex mt-7 justify-content-center">
                <Button label="Next" className="w-full py-3 p-button-raised p-button-rounded" onClick={onNext} disabled={!email || !name} loading={loading}></Button>
            </div>
            {allowWebUserSignUp && (
                <div className="flex mt-3 justify-content-center">
                    <strong>User sign up is by invitation only</strong>
                </div>
            )}
        </div>
    );
};

export default EnterDetailsStep;
