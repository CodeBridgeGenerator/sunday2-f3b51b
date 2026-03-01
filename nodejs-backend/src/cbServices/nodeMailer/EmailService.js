const { BadRequest } = require('@feathersjs/errors');
const express = require('express');
const axios = require('axios');

class EmailService {
    constructor() {
        this.response = {};
        this.getApiKey();
        this.authStatus = false;
    }

    // get the api key
    getApiKey() {
        const app = express();
        this.apiAccess = app.get('apiAccess');
    }

    // use axios and call the cb partner for verification
    async onEmailSendingChecker() {
        const requestOptions = {
            method: 'post',
            url: this.apiAccess.endPoint,
            data: {
                query: 'sending email',
                userAccount: this.apiAccess.userAccount
            },
            headers: {
                Authorization: `Bearer ${this.apiAccess.apiKey}`,
                'Content-Type': 'application/json'
            }
        };
        return await axios(requestOptions);
    }

    // verificatin
    onVerification() {
        if (this.authStatus) {
            process.env.MAIL_HOST = this.reponse.MAIL_HOST;
            process.env.MAIL_PORT = this.reponse.MAIL_PORT;
            process.env.MAIL_USERNAME = this.reponse.MAIL_USERNAME;
            process.env.MAIL_PASSWORD = this.reponse.MAIL_PASSWORD;
        } else {
            throw BadRequest('No access to send emails.');
        }
    }

    // sendMail
    async sendMailStatus() {
        if (process.env.MAIL_USERNAME && process.env.MAIL_PASSWORD) {
            return true;
        }
        this.response = await this.onEmailSendingChecker();
        this.authStatus = this.response.authStatus;
        this.onVerification();
        return {
            status: this.authStatus.status,
            message: this.authStatus.message
        };
    }
}

module.exports = EmailService;
