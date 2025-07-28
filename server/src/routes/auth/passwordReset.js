import { Router } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

import User from '../../models/User.js';
import emailService from '../../services/emailService.js';
import { createErrorDto, createSuccessDto } from '../../dto/index.js';
import { ERROR_MESSAGES } from '../../constants/errorMessages.js';

const router = Router();

// @desc    Request password reset
// @route   POST /auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json(createErrorDto('Email is required', 'VALIDATION_ERROR'));
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Don't reveal if user exists or not for security
            return res.status(200).json(
                createSuccessDto(
                    {},
                    'If an account with that email exists, we have sent a password reset link.'
                )
            );
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

        // Save reset token to user
        user.passwordResetToken = resetToken;
        user.passwordResetExpires = resetTokenExpiry;
        await user.save();

        // Send password reset email
        try {
            await emailService.sendPasswordResetEmail(user.email, user.name || user.username, resetToken);
            console.log('✅ Password reset email sent successfully to:', user.email);
        } catch (emailError) {
            console.error('⚠️ Failed to send password reset email:', emailError);
            // Clear the reset token if email fails
            user.passwordResetToken = undefined;
            user.passwordResetExpires = undefined;
            await user.save();
            
            return res.status(500).json(
                createErrorDto('Failed to send password reset email. Please try again.', 'EMAIL_ERROR')
            );
        }

        res.status(200).json(
            createSuccessDto(
                {},
                'If an account with that email exists, we have sent a password reset link.'
            )
        );
    } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json(createErrorDto(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 'INTERNAL_SERVER_ERROR'));
    }
});

// @desc    Reset password with token
// @route   POST /auth/reset-password
// @access  Public
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json(createErrorDto('Token and new password are required', 'VALIDATION_ERROR'));
        }

        if (newPassword.length < 6) {
            return res.status(400).json(createErrorDto('Password must be at least 6 characters long', 'VALIDATION_ERROR'));
        }

        // Find user with valid reset token
        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json(
                createErrorDto('Invalid or expired password reset token', 'INVALID_TOKEN')
            );
        }

        // Hash new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update user password and clear reset token
        user.password = hashedPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        console.log('✅ Password reset successfully for user:', user.email);

        res.status(200).json(
            createSuccessDto(
                {},
                'Password has been reset successfully. You can now login with your new password.'
            )
        );
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json(createErrorDto(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 'INTERNAL_SERVER_ERROR'));
    }
});

// @desc    Verify reset token (optional - for frontend validation)
// @route   GET /auth/verify-reset-token/:token
// @access  Public
router.get('/verify-reset-token/:token', async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(400).json(createErrorDto('Token is required', 'VALIDATION_ERROR'));
        }

        // Find user with valid reset token
        const user = await User.findOne({
            passwordResetToken: token,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json(
                createErrorDto('Invalid or expired password reset token', 'INVALID_TOKEN')
            );
        }

        res.status(200).json(
            createSuccessDto(
                { valid: true },
                'Reset token is valid'
            )
        );
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json(createErrorDto(ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 'INTERNAL_SERVER_ERROR'));
    }
});

export default router;
