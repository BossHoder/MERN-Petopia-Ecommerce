import { Router } from 'express';

import userService from '../../services/userService.js';
import { validateUserRegistration } from '../../validations/userValidation.js';
import { createErrorDto, createSuccessDto } from '../../dto/index.js';
import { ERROR_MESSAGES } from '../../constants/errorMessages.js';

const router = Router();

router.post('/register', async (req, res) => {
    try {
        const { error } = validateUserRegistration(req.body);
        if (error) {
            return res.status(422).json(createErrorDto(error.details[0].message, 'VALIDATION_ERROR'));
        }

        const result = await userService.createUser({
            ...req.body,
            provider: 'local',
        });

        if (!result.success) {
            return res
                .status(422)
                .json(createErrorDto(result.error || ERROR_MESSAGES.REGISTRATION_FAILED, 'REGISTRATION_ERROR'));
        }

        res.status(201).json(createSuccessDto({ user: result.user }, ERROR_MESSAGES.USER_REGISTERED_SUCCESSFULLY));
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json(createErrorDto(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 'INTERNAL_SERVER_ERROR'));
    }
});

export default router;
