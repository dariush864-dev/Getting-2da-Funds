const stripe = 
Stripe('pk_test_51Tsh88DQpw9nHMqkCNPse41PZ2TMw6xf4HNjn2B5dIQ2n5i2PBzA17KT1tM11LIidRqPMhvjwXrFHZ9owIlDrA00S5cDS2m7');

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('payment-form');
    const productSelect = document.getElementById('product-select');
    const submitBtn = document.getElementById('submit-btn');
    let elements;

    // 1. Disable button immediately so user can't click it too early
    submitBtn.disabled = true;
    submitBtn.textContent = "Loading...";

    async function setupPayment() {
        try {
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
                
                // 2. Form is ready, enable the button
                submitBtn.disabled = false;
                submitBtn.textContent = "Pay now";
            } else {
                console.error("No clientSecret received");
            }
        } catch (err) {
            console.error("Setup failed", err);
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Safety check: ensure elements exist
        if (!elements) return;

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: { return_url: window.location.origin + '/success.html' }
        });
        
        if (error) console.error(error);
    });

    setupPayment();
    productSelect.addEventListener('change', setupPayment);
});
