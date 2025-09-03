// /api/kakao-notify.js (Vercel Serverless Function)
const ALLOWED_METHODS = ['POST', 'OPTIONS'];

function cors(res, origin) {
	res.setHeader('Access-Control-Allow-Origin', origin || '*');
	res.setHeader('Access-Control-Allow-Methods', ALLOWED_METHODS.join(','));
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	res.setHeader('Access-Control-Allow-Credentials', 'true');
}

function validateBody(b) {
	return b &&
		typeof b.orderNumber === 'string' &&
		typeof b.customerName === 'string' &&
		Array.isArray(b.products) &&
		typeof b.totalAmount === 'number' &&
		typeof b.orderTime === 'string';
}

function buildMessageText(body) {
	const items = body.products.map(p =>
		`${p.name} x ${p.qty}\uAC1C - ${Number(p.price * p.qty).toLocaleString()}\uC6D0`
	).join('\n');

	return `\uC8FC\uBB38\uBC88\uD638: ${body.orderNumber}\n\uC8FC\uBB38\uC2DC\uAC04: ${body.orderTime}\n\uACE0\uAC1D\uBA85: ${body.customerName}\n\ud83d\udce6 \uC8FC\uBB38\uC0C1\uD488:\n${items}\n\n\ud83d\udcb0 \uCD1D \uACB0\uC81C\uAE08\uC561: ${Number(body.totalAmount).toLocaleString()}\uC6D0`;
}

export default async function handler(req, res) {
	const origin = process.env.FRONT_ORIGIN || '*';
	cors(res, origin);

	if (!ALLOWED_METHODS.includes(req.method)) {
		return res.status(405).json({ success: false, error: 'method not allowed' });
	}
	if (req.method === 'OPTIONS') {
		return res.status(204).end();
	}

	try {
		const body = req.body || {};
		if (!validateBody(body)) {
			return res.status(400).json({ success: false, error: 'invalid payload' });
		}

		const {
			KAKAO_API_URL,
			KAKAO_SENDER_KEY,
			KAKAO_TEMPLATE_CODE,
			KAKAO_AUTH,
			BUSINESS_PHONE,
			ORDER_LINK_BASE
		} = process.env;

		if (!KAKAO_API_URL || !KAKAO_SENDER_KEY || !KAKAO_TEMPLATE_CODE || !KAKAO_AUTH || !BUSINESS_PHONE) {
			return res.status(500).json({ success: false, error: 'server env not configured' });
		}

		const message = buildMessageText(body);

		const partnerPayload = {
			senderKey: KAKAO_SENDER_KEY,
			templateCode: KAKAO_TEMPLATE_CODE,
			recipientList: [{
				recipient: BUSINESS_PHONE,
				message,
				buttons: [{
					type: 'WL',
					name: '\uC8FC\uBB38\uC11C \uBCF4\uAE30',
					url_mobile: `${ORDER_LINK_BASE || ''}${body.orderNumber}`,
					url_pc: `${ORDER_LINK_BASE || ''}${body.orderNumber}`
				}]
			}]
		};

		const resp = await fetch(KAKAO_API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': KAKAO_AUTH
			},
			body: JSON.stringify(partnerPayload)
		});

		const text = await resp.text();
		if (!resp.ok) {
			return res.status(resp.status).json({ success: false, error: text || 'partner error' });
		}
		return res.status(200).json({ success: true });
	} catch (e) {
		return res.status(500).json({ success: false, error: e?.message || 'server error' });
	}
}


