const samplePaymentMethods = [
    {
        name: 'Bank Transfer',
        description: 'Transfer money directly from your bank account.',
        type: 'bank_transfer',
        isActive: true,
    },
    {
        name: 'Momo',
        description: 'Pay using Momo e-wallet.',
        type: 'momo',
        isActive: true,
    },
    {
        name: 'ZaloPay',
        description: 'Pay using ZaloPay e-wallet.',
        type: 'zalopay',
        isActive: true,
    },
    {
        name: 'Cash on Delivery',
        description: 'Pay with cash when your order is delivered.',
        type: 'cod',
        isActive: true,
    },
];

export default samplePaymentMethods;