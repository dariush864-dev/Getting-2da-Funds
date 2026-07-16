const stripe = 
Stripe('pk_live_51Tsh7bDH1lCZTxjVij19zVPU9pQDGIaNDZuRk7Zat5Mnvu3W76utFP2h6EkUI9Ku1Mbhd3hrWbPZMsulxebtFlYH003qw7GkhE');

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('payment-form');
    const productSelect = document.getElementById('product-select');
    let elements;

    async function setupPayment() {
        const response = await fetch('/api/payments/intents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': 
'i_am_sovereign_1991' },
            body: JSON.stringify({
                orderId: 'order_' + Date.now(),
                productId: productSelect.value
            })
        });

        const data = await response.json();

        if (data.clientSecret) {
            elements = stripe.elements({ clientSecret: data.clientSecret });
            const paymentElement = elements.create('payment');
            paymentElement.mount('#payment-element');
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: { return_url: window.location.origin + '/success.html' }
        });
        if (error) console.error(error);
    });

    setupPayment();
    productSelect.addEventListener('change', setupPayment);
});
