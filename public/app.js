const stripe = Stripe('pk_test_51Tsh88DQpw9nHMqkCNPse41PZ2TMw6xf4HNjn2B5dIQ2n5i2PBzA17KT1tM11LIidRqPMhvjwXrEkFHZ9owIlDrA00S5cDS2m7');

document.addEventListener('DOMContentLoaded', async () => {
    const productSelect = document.getElementById('product-select');
    const customAmountInput = document.getElementById('custom-amount');
    const paymentElementContainer = document.getElementById('payment-element');
    const form = document.getElementById('payment-form'); // Assuming your <form id="payment-form"> exists
    
    let elements;

    productSelect.addEventListener('change', (e) => {
        if (e.target.value === 'donation') {
            customAmountInput.style.display = 'block';
        } else {
            customAmountInput.style.display = 'none';
            customAmountInput.value = '';
        }
    });

    async function initializeCheckout() {
        const testOrderId = 'order_' + Date.now();
        let amountToSend = null;

        if (productSelect.value === 'donation') {
            if (!customAmountInput.value || customAmountInput.value < 1) {
                paymentElementContainer.innerHTML = '<p style="color: #aab7c4;">Please enter an amount of at least $1.00.</p>';
                return;
            }
            amountToSend = Math.round(parseFloat(customAmountInput.value) * 100);
        }

        const response = await fetch('/api/payments/intents', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': 
'i_am_sovereign_1991' },
            body: JSON.stringify({amount: 100, currency: 'usd' })
        });

        const data = await response.json();
        
        if (data.clientSecret) {
            elements = stripe.elements({ clientSecret: data.clientSecret });
            const paymentElement = elements.create('payment');
            paymentElementContainer.innerHTML = '';
            paymentElement.mount('#payment-element');
        }
    }

    // Handle form submission
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: { return_url: 'http://localhost:3000/success.html' },
        });

        if (error) console.error('Stripe Payment Error:', error.message);
    });

    initializeCheckout();
    productSelect.addEventListener('change', initializeCheckout);
    customAmountInput.addEventListener('input', () => {
        clearTimeout(window.typingTimer);
        window.typingTimer = setTimeout(initializeCheckout, 500);
    });
});
