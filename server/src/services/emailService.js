// ===========================================
// EMAIL SERVICE
// ===========================================
// This service handles email functionality using CloudMailin

import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import mjml from 'mjml';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ERROR_MESSAGES } from '../constants/errorMessages.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class EmailService {
    constructor() {
        this.transporter = null;
        this.isProduction = process.env.NODE_ENV === 'production';
        this.initialized = false;
        this.initializeTransporter();
    }

    // Initialize email transporter
    async initializeTransporter() {
        try {
            if (process.env.CLOUDMAILIN_SMTP_URL) {
                // Use CloudMailin SMTP (works in both development and production)
                this.transporter = nodemailer.createTransport(process.env.CLOUDMAILIN_SMTP_URL);
                console.log('📧 Email service initialized with CloudMailin SMTP');
                this.initialized = true;
            } else {
                // Fallback: Use Ethereal Email for testing
                console.log('📧 Initializing development email service with Ethereal Email...');
                await this.createTestAccount();
                this.initialized = true;
            }
        } catch (error) {
            console.error('Failed to initialize email transporter:', error);
            this.initialized = false;
        }
    }

    // Create test account for development
    async createTestAccount() {
        try {
            const testAccount = await nodemailer.createTestAccount();
            this.transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass,
                },
            });
            console.log('📧 Development email account created:', testAccount.user);
            console.log('📧 Email service initialized with Ethereal Email for development');
        } catch (error) {
            console.error('Failed to create test email account:', error);
        }
    }

    // Load and compile email template
    loadTemplate(templateName, data) {
        try {
            const templatePath = join(__dirname, '../templates/emails', `${templateName}.mjml`);
            const mjmlTemplate = readFileSync(templatePath, 'utf8');

            // Compile MJML template with Handlebars
            const handlebarsTemplate = handlebars.compile(mjmlTemplate);
            const compiledMjml = handlebarsTemplate(data);

            // Convert MJML to HTML
            const { html, errors } = mjml(compiledMjml);

            if (errors.length > 0) {
                console.warn('MJML compilation warnings:', errors);
            }

            return html;
        } catch (error) {
            console.error(`Failed to load email template ${templateName}:`, error);
            return this.getFallbackTemplate(templateName, data);
        }
    }

    // Fallback HTML template if MJML fails
    getFallbackTemplate(templateName, data) {
        const templates = {
            welcome: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #ff6b35;">Welcome to Petopia! 🐾</h1>
                    <p>Hi ${data.userName || 'Pet Lover'},</p>
                    <p>Thank you for joining our pet-loving community! We're excited to help you find the best products for your furry friends.</p>
                    <a href="${
                        data.loginUrl
                    }" style="background: #ff6b35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Start Shopping</a>
                </div>
            `,
            passwordReset: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #ff6b35;">Reset Your Password 🔐</h1>
                    <p>Hi ${data.userName || 'there'},</p>
                    <p>You requested to reset your password. Click the button below to create a new password:</p>
                    <a href="${
                        data.resetUrl
                    }" style="background: #ff6b35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Reset Password</a>
                    <p><small>This link expires in 1 hour. If you didn't request this, please ignore this email.</small></p>
                </div>
            `,
            orderConfirmation: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #ff6b35;">Order Confirmed! 📦</h1>
                    <p>Hi ${data.customerName || 'Valued Customer'},</p>
                    <p>Thank you for your order! Your order <strong>#${
                        data.orderNumber
                    }</strong> has been confirmed.</p>
                    <p><strong>Total: ${data.totalAmount}</strong></p>
                    <a href="${
                        data.orderUrl
                    }" style="background: #ff6b35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">View Order</a>
                </div>
            `,
            shippingNotification: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #ff6b35;">Your Order is on the Way! 🚚</h1>
                    <p>Hi ${data.customerName || 'Valued Customer'},</p>
                    <p>Great news! Your order <strong>#${
                        data.orderNumber
                    }</strong> has been shipped and is on its way to you.</p>
                    <p><strong>Tracking Number:</strong> ${data.trackingNumber || 'Will be provided soon'}</p>
                    <a href="${
                        data.trackingUrl || data.orderUrl
                    }" style="background: #ff6b35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Track Package</a>
                </div>
            `,
        };

        return templates[templateName] || '<p>Email template not found.</p>';
    }

    // Ensure service is initialized
    async ensureInitialized() {
        if (!this.initialized) {
            await this.initializeTransporter();
        }
    }

    // Send email
    async sendEmail({ to, subject, templateName, templateData, attachments = [] }) {
        try {
            await this.ensureInitialized();

            if (!this.transporter) {
                throw new Error('Email transporter not initialized');
            }

            const html = this.loadTemplate(templateName, templateData);

            const mailOptions = {
                from: {
                    name: process.env.EMAIL_FROM_NAME || 'Petopia Pet Store',
                    address: process.env.EMAIL_FROM || 'noreply@petopia.com',
                },
                to,
                subject,
                html,
                attachments,
            };

            const result = await this.transporter.sendMail(mailOptions);

            // Log preview URL for development
            if (!this.isProduction) {
                console.log('📧 Email sent successfully!');
                console.log('Preview URL:', nodemailer.getTestMessageUrl(result));
            }

            return {
                success: true,
                messageId: result.messageId,
                previewUrl: this.isProduction ? null : nodemailer.getTestMessageUrl(result),
            };
        } catch (error) {
            console.error('Failed to send email:', error);
            return {
                success: false,
                error: error.message,
            };
        }
    }

    // Send welcome email
    async sendWelcomeEmail(userEmail, userName) {
        return await this.sendEmail({
            to: userEmail,
            subject: 'Welcome to Petopia! 🐾',
            templateName: 'welcome',
            templateData: {
                userName,
                loginUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/login`,
                supportEmail: process.env.EMAIL_SUPPORT || 'support@petopia.com',
            },
        });
    }

    // Send password reset email
    async sendPasswordResetEmail(userEmail, userName, resetToken) {
        const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

        return await this.sendEmail({
            to: userEmail,
            subject: 'Reset Your Petopia Password 🔐',
            templateName: 'passwordReset',
            templateData: {
                userName,
                resetUrl,
                supportEmail: process.env.EMAIL_SUPPORT || 'support@petopia.com',
            },
        });
    }

    // Send order confirmation email
    async sendOrderConfirmationEmail(order, customerEmail, customerName) {
        // Format delivery dates for email
        const formatDate = (date) => {
            return new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        };

        const estimatedDeliveryDate = order.estimatedDeliveryDate
            ? formatDate(order.estimatedDeliveryDate)
            : 'To be determined';

        const deliveryRangeStart = order.estimatedDeliveryRange?.start
            ? new Date(order.estimatedDeliveryRange.start).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
              })
            : '';

        const deliveryRangeEnd = order.estimatedDeliveryRange?.end
            ? new Date(order.estimatedDeliveryRange.end).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
              })
            : '';

        return await this.sendEmail({
            to: customerEmail,
            subject: `Order Confirmation - #${order.orderNumber} 📦`,
            templateName: 'orderConfirmation',
            templateData: {
                customerName,
                orderNumber: order.orderNumber,
                totalAmount: `${order.totalPrice?.toLocaleString('vi-VN')}đ`,
                orderUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/orders/${order._id}`,
                orderItems: order.orderItems,
                shippingAddress: order.shippingAddress,
                supportEmail: process.env.EMAIL_SUPPORT || 'support@petopia.com',
                // Add delivery estimate data
                estimatedDeliveryDate,
                deliveryRangeStart,
                deliveryRangeEnd,
            },
        });
    }

    // Send shipping notification email
    async sendShippingNotificationEmail(order, customerEmail, customerName, trackingInfo = {}) {
        const currentDate = new Date().toLocaleDateString('vi-VN');
        const estimatedDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('vi-VN'); // 3 days from now

        return await this.sendEmail({
            to: customerEmail,
            subject: `Your Order is On Its Way! 🚚 - #${order.orderNumber}`,
            templateName: 'shippingNotification',
            templateData: {
                customerName,
                orderNumber: order.orderNumber,
                shippedDate: currentDate,
                estimatedDelivery,
                trackingNumber: trackingInfo.trackingNumber || null,
                trackingUrl: trackingInfo.trackingUrl || null,
                orderUrl: `${process.env.CLIENT_URL || 'http://localhost:3000'}/orders/${order._id}`,
                shippingAddress: order.shippingAddress,
                supportEmail: process.env.EMAIL_SUPPORT || 'support@petopia.com',
            },
        });
    }

    // Verify email configuration
    async verifyConnection() {
        try {
            await this.ensureInitialized();

            if (!this.transporter) {
                return { success: false, error: 'Transporter not initialized' };
            }

            await this.transporter.verify();
            return { success: true, message: 'Email service is ready' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Export singleton instance
const emailService = new EmailService();
export default emailService;
