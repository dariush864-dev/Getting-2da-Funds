const stripe = Stripe(pk_live_51Tsh7bDH1lCZTxjVij19zVPU9pQDGIaNDZuRk7Zat5Mnvu3W76utFP2h6EkUI9Ku1Mbhd3hrWbPZMsulxebtFlYH003qw7GkhE);

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
        
        if (!elements) {
            console.error('Payment elements not initialized. Please wait for the form to load.');
            return; 
        }

        const { error } = await stripe.confirmPayment({
            elements: elements,
            confirmParams: { 
                return_url: window.location.origin + '/success.html' 
            }
        });

        if (error) {
            console.error('Stripe Payment Error:', error.message);
        }
    });

    initializeCheckout();
    productSelect.addEventListener('change', initializeCheckout);
    customAmountInput.addEventListener('input', () => {
        clearTimeout(window.typingTimer);
        window.typingTimer = setTimeout(initializeCheckout, 500);
    });
});
