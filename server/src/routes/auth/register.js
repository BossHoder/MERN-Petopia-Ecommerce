import { Router } from 'express';

import userService from '../../services/userService.js';
import emailService from '../../services/emailService.js';
import { validateUserRegistration } from '../../validations/userValidation.js';
import { createErrorDto, createSuccessDto } from '../../dto/index.js';
import { ERROR_MESSAGES } from '../../constants/errorMessages.js';

const router = Router();

router.post('/register', async (req, res) => {
    try {
        console.log('📝 Registration attempt:', {
            email: req.body.email,
            username: req.body.username,
            name: req.body.name,
        });

        const { error } = validateUserRegistration(req.body);
        if (error) {
            console.log('❌ Validation error:', error.details[0].message);
            return res.status(422).json(createErrorDto(error.details[0].message, 'VALIDATION_ERROR'));
        }

        const result = await userService.createUser({
            ...req.body,
            provider: 'local',
        });

        if (!result.success) {
            console.log('❌ User creation failed:', result.error);

            // Handle duplicate key errors with user-friendly messages
            let errorMessage = result.error || ERROR_MESSAGES.REGISTRATION_FAILED;

            if (result.error && result.error.includes('E11000 duplicate key error')) {
                if (result.error.includes('username_1')) {
                    errorMessage = 'Username already exists. Please choose a different username.';
                } else if (result.error.includes('email_1')) {
                    errorMessage = 'Email already exists. Please use a different email address.';
                } else {
                    errorMessage = 'This account information is already registered. Please use different details.';
                }
            }

            return res.status(422).json(createErrorDto(errorMessage, 'REGISTRATION_ERROR'));
        }

        // Send welcome email (don't block registration if email fails)
        try {
            await emailService.sendWelcomeEmail(result.user.email, result.user.name || result.user.username);
            console.log('✅ Welcome email sent successfully to:', result.user.email);
        } catch (emailError) {
            console.error('⚠️ Failed to send welcome email:', emailError);
            // Continue with registration success even if email fails
        }

        res.status(201).json(createSuccessDto({ user: result.user }, ERROR_MESSAGES.USER_REGISTERED_SUCCESSFULLY));
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json(createErrorDto(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 'INTERNAL_SERVER_ERROR'));
    }
});

export default router;
