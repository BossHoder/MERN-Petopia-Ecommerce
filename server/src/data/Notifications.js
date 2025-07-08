// ===========================================
// NOTIFICATIONS SEED DATA
// ===========================================
// This file contains seed data for notifications

const notifications = [
    {
        type: "welcome",
        title: "Welcome to Petopia!",
        message: "Thank you for joining our pet-loving community. Explore our wide range of products for your furry friends!",
        relatedData: {
            actionUrl: "/products"
        },
        priority: "medium",
        channels: {
            inApp: true,
            email: true,
            sms: false
        }
    },
    {
        type: "promotion",
        title: "Special Offer Just for You!",
        message: "Get 10% off your first order with code WELCOME10. Valid for new customers only.",
        relatedData: {
            couponCode: "WELCOME10",
            actionUrl: "/products"
        },
        priority: "high",
        channels: {
            inApp: true,
            email: true,
            sms: false
        }
    },
    {
        type: "order_status",
        title: "Order Confirmed",
        message: "Your order has been confirmed and is being processed. We'll notify you when it's ready to ship.",
        relatedData: {
            actionUrl: "/orders"
        },
        priority: "high",
        channels: {
            inApp: true,
            email: true,
            sms: true
        }
    },
    {
        type: "order_status",
        title: "Order Shipped",
        message: "Good news! Your order is on its way. Track your package using the tracking number provided.",
        relatedData: {
            actionUrl: "/orders"
        },
        priority: "high",
        channels: {
            inApp: true,
            email: true,
            sms: true
        }
    },
    {
        type: "order_status",
        title: "Order Delivered",
        message: "Your order has been successfully delivered. Thank you for shopping with us!",
        relatedData: {
            actionUrl: "/orders"
        },
        priority: "medium",
        channels: {
            inApp: true,
            email: true,
            sms: false
        }
    },
    {
        type: "payment_success",
        title: "Payment Successful",
        message: "Your payment has been processed successfully. Your order is now confirmed.",
        relatedData: {
            actionUrl: "/orders"
        },
        priority: "high",
        channels: {
            inApp: true,
            email: true,
            sms: false
        }
    },
    {
        type: "payment_failed",
        title: "Payment Failed",
        message: "We couldn't process your payment. Please try again or use a different payment method.",
        relatedData: {
            actionUrl: "/checkout"
        },
        priority: "high",
        channels: {
            inApp: true,
            email: true,
            sms: false
        }
    },
    {
        type: "product_back_in_stock",
        title: "Product Back in Stock!",
        message: "Great news! The product you were waiting for is back in stock. Order now before it runs out again.",
        relatedData: {
            actionUrl: "/products"
        },
        priority: "medium",
        channels: {
            inApp: true,
            email: true,
            sms: false
        }
    },
    {
        type: "new_product",
        title: "New Product Alert",
        message: "Check out our latest arrival! Perfect for your pet's needs.",
        relatedData: {
            actionUrl: "/products"
        },
        priority: "low",
        channels: {
            inApp: true,
            email: false,
            sms: false
        }
    },
    {
        type: "review_request",
        title: "How was your experience?",
        message: "We'd love to hear about your recent purchase. Leave a review and help other pet owners!",
        relatedData: {
            actionUrl: "/orders"
        },
        priority: "low",
        channels: {
            inApp: true,
            email: true,
            sms: false
        }
    }
];

export default notifications;
