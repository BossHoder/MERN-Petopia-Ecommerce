/**
 * Order Scheduler Service
 * Handles automatic order status transitions using background jobs
 */

import cron from 'node-cron';
import Order from '../models/Order.js';
import { isReadyForAutomaticTransition, validateAutomaticTransition } from '../utils/deliveryUtils.js';
import { logOrderStatusChange } from '../utils/auditLogger.js';

class OrderSchedulerService {
    constructor() {
        this.isRunning = false;
        this.cronJob = null;
        this.processedOrders = new Set(); // Track processed orders to avoid duplicates
    }

    /**
     * Start the scheduler service
     */
    start() {
        if (this.isRunning) {
            console.log('📅 Order scheduler is already running');
            return;
        }

        // Run every minute to check for pending transitions
        this.cronJob = cron.schedule(
            '* * * * *',
            async () => {
                await this.processAutomaticTransitions();
            },
            {
                scheduled: false,
            },
        );

        this.cronJob.start();
        this.isRunning = true;
        console.log('📅 Order scheduler service started - checking every minute');
    }

    /**
     * Stop the scheduler service
     */
    stop() {
        if (this.cronJob) {
            this.cronJob.stop();
            this.cronJob = null;
        }
        this.isRunning = false;
        console.log('📅 Order scheduler service stopped');
    }

    /**
     * Process all pending automatic transitions
     */
    async processAutomaticTransitions() {
        try {
            const startTime = Date.now();
            console.log('🔄 Checking for automatic order transitions...');

            // Process pending → processing transitions
            const pendingResults = await this.processPendingToProcessing();

            // Process processing → delivering transitions
            const deliveringResults = await this.processProcessingToDelivering();

            const endTime = Date.now();
            const duration = endTime - startTime;

            console.log(`✅ Automatic transition check completed in ${duration}ms`);
            console.log(
                `📊 Results: ${pendingResults.processed} pending→processing, ${deliveringResults.processed} processing→delivering`,
            );

            // Clear processed cache periodically to prevent memory leaks
            if (this.processedOrders.size > 1000) {
                this.clearProcessedCache();
            }
        } catch (error) {
            console.error('❌ Error in automatic transition processing:', error);

            // Log error details for debugging
            await this.logSystemEvent('TRANSITION_PROCESSING_ERROR', {
                error: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString(),
            });
        }
    }

    /**
     * Process pending → processing transitions (after 1 minute)
     */
    async processPendingToProcessing() {
        let processed = 0;
        let errors = 0;

        try {
            const now = new Date();

            // Find orders ready for pending → processing transition
            const orders = await Order.find({
                orderStatus: 'pending',
                'automaticTransitions.pendingToProcessing.scheduledAt': { $lte: now },
                'automaticTransitions.pendingToProcessing.executedAt': { $exists: false },
            });

            console.log(`📦 Found ${orders.length} orders ready for pending → processing transition`);

            for (const order of orders) {
                try {
                    if (this.processedOrders.has(`${order._id}_pending_processing`)) {
                        continue; // Skip if already processed in this cycle
                    }

                    await this.executeStatusTransition(order, 'processing', 'pendingToProcessing');
                    this.processedOrders.add(`${order._id}_pending_processing`);
                    processed++;
                } catch (error) {
                    console.error(`❌ Error processing order ${order.orderNumber}:`, error);
                    errors++;
                }
            }
        } catch (error) {
            console.error('❌ Error processing pending → processing transitions:', error);
            errors++;
        }

        return { processed, errors, total: processed + errors };
    }

    /**
     * Process processing → delivering transitions (after 30 minutes from processing)
     */
    async processProcessingToDelivering() {
        let processed = 0;
        let errors = 0;
        let skipped = 0;

        try {
            const now = new Date();

            // Find orders ready for processing → delivering transition
            const orders = await Order.find({
                orderStatus: 'processing',
                'automaticTransitions.processingToDelivering.scheduledAt': { $lte: now },
                'automaticTransitions.processingToDelivering.executedAt': { $exists: false },
            });

            console.log(`🚚 Found ${orders.length} orders ready for processing → delivering transition`);

            for (const order of orders) {
                try {
                    if (this.processedOrders.has(`${order._id}_processing_delivering`)) {
                        continue; // Skip if already processed in this cycle
                    }

                    // Validate payment requirements for non-COD orders
                    const validation = validateAutomaticTransition(order, 'delivering');
                    if (!validation.isValid) {
                        console.log(
                            `⚠️ Skipping automatic transition for order ${order.orderNumber}: ${validation.reason}`,
                        );
                        skipped++;
                        continue;
                    }

                    await this.executeStatusTransition(order, 'delivering', 'processingToDelivering');
                    this.processedOrders.add(`${order._id}_processing_delivering`);
                    processed++;
                } catch (error) {
                    console.error(`❌ Error processing order ${order.orderNumber}:`, error);
                    errors++;
                }
            }
        } catch (error) {
            console.error('❌ Error processing processing → delivering transitions:', error);
            errors++;
        }

        return { processed, errors, skipped, total: processed + errors + skipped };
    }

    /**
     * Execute a status transition for an order
     * @param {Object} order - Order document
     * @param {string} newStatus - New status to transition to
     * @param {string} transitionType - Type of transition for tracking
     */
    async executeStatusTransition(order, newStatus, transitionType) {
        try {
            const oldStatus = order.orderStatus;
            const now = new Date();

            console.log(`🔄 Executing automatic transition: ${order.orderNumber} ${oldStatus} → ${newStatus}`);

            // Update order status and mark transition as executed
            const updateData = {
                orderStatus: newStatus,
                [`automaticTransitions.${transitionType}.executedAt`]: now,
                $push: {
                    statusHistory: {
                        status: newStatus,
                        timestamp: now,
                        comment: `Automatic transition from ${oldStatus} to ${newStatus}`,
                        changedBy: 'system',
                        isAutomatic: true,
                    },
                },
            };

            // Add deliveredAt timestamp if transitioning to delivered
            if (newStatus === 'delivered') {
                updateData.deliveredAt = now;
                updateData.isDelivered = true;
            }

            const updatedOrder = await Order.findByIdAndUpdate(order._id, updateData, { new: true });

            // Log the status change for audit trail
            await this.logAutomaticStatusChange(updatedOrder, oldStatus, newStatus);

            console.log(`✅ Successfully transitioned order ${order.orderNumber} from ${oldStatus} to ${newStatus}`);
        } catch (error) {
            console.error(`❌ Error executing transition for order ${order.orderNumber}:`, error);
        }
    }

    /**
     * Log automatic status changes for audit trail
     * @param {Object} order - Updated order document
     * @param {string} oldStatus - Previous status
     * @param {string} newStatus - New status
     */
    async logAutomaticStatusChange(order, oldStatus, newStatus) {
        try {
            // Use audit logger if available, otherwise log to console
            if (typeof logOrderStatusChange === 'function') {
                await logOrderStatusChange({
                    orderId: order._id,
                    orderNumber: order.orderNumber,
                    oldStatus,
                    newStatus,
                    changedBy: 'system',
                    ipAddress: 'system',
                    userAgent: 'OrderSchedulerService',
                    notes: `Automatic transition from ${oldStatus} to ${newStatus}`,
                    isAutomatic: true,
                });
            } else {
                console.log(
                    `📝 Audit log: Order ${order.orderNumber} status changed from ${oldStatus} to ${newStatus} (automatic)`,
                );
            }
        } catch (error) {
            console.error('❌ Error logging automatic status change:', error);
        }
    }

    /**
     * Schedule automatic transitions for a new order
     * @param {Object} order - Order document
     */
    async scheduleTransitionsForOrder(order) {
        try {
            const orderDate = order.createdAt || new Date();

            // Calculate transition times
            const pendingToProcessingTime = new Date(orderDate.getTime() + 1 * 60 * 1000); // 1 minute
            const processingToDeliveringTime = new Date(orderDate.getTime() + 31 * 60 * 1000); // 31 minutes

            // Update order with scheduled transition times
            await Order.findByIdAndUpdate(order._id, {
                'automaticTransitions.pendingToProcessing.scheduledAt': pendingToProcessingTime,
                'automaticTransitions.pendingToProcessing.isAutomatic': true,
                'automaticTransitions.processingToDelivering.scheduledAt': processingToDeliveringTime,
                'automaticTransitions.processingToDelivering.isAutomatic': true,
            });

            console.log(`📅 Scheduled automatic transitions for order ${order.orderNumber}:`);
            console.log(`   - Pending → Processing: ${pendingToProcessingTime.toISOString()}`);
            console.log(`   - Processing → Delivering: ${processingToDeliveringTime.toISOString()}`);
        } catch (error) {
            console.error(`❌ Error scheduling transitions for order ${order.orderNumber}:`, error);
        }
    }

    /**
     * Get scheduler status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            processedOrdersCount: this.processedOrders.size,
            nextRun: this.cronJob ? 'Every minute' : 'Not scheduled',
        };
    }

    /**
     * Clear processed orders cache (for memory management)
     */
    clearProcessedCache() {
        this.processedOrders.clear();
        console.log('🧹 Cleared processed orders cache');
    }

    /**
     * Log system events
     * @param {string} event - Event name
     * @param {Object} metadata - Additional metadata
     */
    async logSystemEvent(event, metadata = {}) {
        try {
            const logEntry = {
                timestamp: new Date().toISOString(),
                event: `SCHEDULER_${event.toUpperCase()}`,
                service: 'OrderSchedulerService',
                metadata,
            };

            console.log('📝 SCHEDULER LOG:', JSON.stringify(logEntry, null, 2));
            return logEntry;
        } catch (error) {
            console.error('❌ Error logging system event:', error);
        }
    }
}

// Create singleton instance
const orderSchedulerService = new OrderSchedulerService();

export default orderSchedulerService;
