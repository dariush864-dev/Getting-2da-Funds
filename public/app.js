const stripe = 
Stripe('pk_test_51Tsh88DQpw9nHMqkCNPse41PZ2TMw6xf4HNjn2B5dIQ2n5i2PBzA17KT1tM11LIidRqPMhvjwXrFHZ9owIlDrA00S5cDS2m7');

const productSelect = document.getElementById('productSelect');
const submitBtn = document.getElementById('submitBtn');

async function setupPayment() {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Loading...';

    try {
        const response = await fetch('/api/public/intents', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderId: 'order_' + Date.now(),
                productId: productSelect.value
            })
        });

        if (!response.ok) {
            throw new Error('Payment initialization failed');
        }

        const data = await response.json();
        return data.clientSecret;
    } catch (error) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Pay Now';
        throw error;
    }
}

submitBtn.addEventListener('click', async () => {
    try {
        const clientSecret = await setupPayment();
        const elements = stripe.elements({ clientSecret });
        const paymentElement = elements.create('payment');
        paymentElement.mount('#payment-element');
    } catch (error) {
        console.error('Error:', error);
    }
});
