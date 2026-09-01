const CONSUMER_KEY = process.env.DARAJA_CONSUMER_KEY || '';
const CONSUMER_SECRET = process.env.DARAJA_CONSUMER_SECRET || '';
const PASSKEY = process.env.DARAJA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
const SHORTCODE = process.env.DARAJA_SHORTCODE || '174379';
const CALLBACK_URL = process.env.DARAJA_CALLBACK_URL || 'https://example.com/api/deposit/mpesa-callback';
const ENVIRONMENT = process.env.DARAJA_ENV || 'sandbox'; // sandbox or production

const getBaseUrl = () => {
  return ENVIRONMENT === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';
};

// Generate Access Token using native fetch
export const getAccessToken = async () => {
  if (!CONSUMER_KEY || !CONSUMER_SECRET) {
    return null;
  }
  try {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    const response = await fetch(`${getBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`
      }
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error fetching Daraja access token:', error.message);
    return null;
  }
};

// Initiate STK Push using native fetch
export const initiateSTKPush = async (phone, amount, accountReference = 'Aviator Topup') => {
  // Format phone to 254XXXXXXXXX format
  let formattedPhone = phone.replace(/\D/g, '');
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '254' + formattedPhone.slice(1);
  } else if (formattedPhone.startsWith('+254')) {
    formattedPhone = formattedPhone.slice(1);
  }

  const token = await getAccessToken();

  // If no Daraja keys provided, simulate standard STK Push response
  if (!token) {
    console.log(`[Daraja Simulator] Triggering STK Push for Phone: ${formattedPhone}, Amount: KES ${amount}`);
    const simulatedCheckoutId = 'ws_CO_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    return {
      success: true,
      simulated: true,
      CheckoutRequestID: simulatedCheckoutId,
      MerchantRequestID: 'MR_' + Date.now(),
      ResponseCode: '0',
      ResponseDescription: 'Success. Request accepted for processing (Simulated)',
      CustomerMessage: `STK Push sent to ${formattedPhone} for KES ${amount}. (Simulated auto-credit in test mode)`
    };
  }

  try {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');

    const payload = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: SHORTCODE,
      PhoneNumber: formattedPhone,
      CallBackURL: CALLBACK_URL,
      AccountReference: accountReference,
      TransactionDesc: `Aviator Account Deposit KES ${amount}`
    };

    const response = await fetch(`${getBaseUrl()}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    return {
      success: data.ResponseCode === '0',
      simulated: false,
      CheckoutRequestID: data.CheckoutRequestID,
      MerchantRequestID: data.MerchantRequestID,
      ResponseCode: data.ResponseCode,
      ResponseDescription: data.ResponseDescription,
      CustomerMessage: data.CustomerMessage
    };
  } catch (error) {
    console.error('STK Push Error:', error.message);
    throw new Error('Failed to initiate STK push via Daraja API.');
  }
};
