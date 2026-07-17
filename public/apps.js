const stripe = 
Stripe('pk_live_51Tsh7bDH1lCZTxjVij19zVPU9pQDGIaNDZuRk7Zat5Mnvu3W76utFP2h6EkUI9Ku1Mbhd3hrWbPZMsulxebtFlYH003qw7GkhE')

async function setupPayment() {
    const productSelect = document.getElementById('productSelect');
    const submitBtn = document.getElementById('submitBtn');

    submitBtn.disabled = true;
    submitBtn.textContent = "Loading...";

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
        console.error('Error:', error);
        submitBtn.disabled = false;
        submitBtn.textContent = "Pay Now";
        throw error;
    }
}
