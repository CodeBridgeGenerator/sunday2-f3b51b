async function verifyEmail(req, res) {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const { default: emailValidator } = await import('node-email-verifier');

        const isValid = await emailValidator(email, {
            checkMx: true,
            timeout: '400ms'
        });

        if (isValid) {
            return res.status(200).json({
                valid: true,
                message: 'Email domain is valid and can receive emails.'
            });
        } else {
            return res.status(400).json({
                valid: false,
                message: 'Email domain is invalid or cannot receive emails.'
            });
        }
    } catch (error) {
        if (error.message.match(/timed out/)) {
            return res.status(408).json({ error: 'Timeout on DNS MX lookup.' });
        } else {
            return res.status(500).json({
                error: 'An error occurred while verifying the email.'
            });
        }
    }
}

module.exports = verifyEmail;
