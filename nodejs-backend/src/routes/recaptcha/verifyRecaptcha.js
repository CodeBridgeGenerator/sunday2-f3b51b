const axios = require('axios');

async function verifyRecaptcha(req, res) {
    const { token } = req.body;

    if (!token) {
        return res
            .status(400)
            .json({ success: false, message: 'Token is required' });
    }

    try {
        // Verify the token with Google's reCAPTCHA API
        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=6LdLI_oqAAAAAHtnWq4iKDQxaaSn82M8jmM_OO0u&response=${token}`
        );

        const { success, score } = response.data;

        if (success && score >= 0.5) {
            // reCAPTCHA verification passed
            return res
                .status(200)
                .json({ success: true, message: 'reCAPTCHA verified' });
        } else {
            // reCAPTCHA verification failed
            return res.status(400).json({
                success: false,
                message: 'reCAPTCHA verification failed'
            });
        }
    } catch (error) {
        console.error('Error verifying reCAPTCHA:', error);
        return res
            .status(500)
            .json({ success: false, message: 'Internal server error' });
    }
}

module.exports = verifyRecaptcha;
