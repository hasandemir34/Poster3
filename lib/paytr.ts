import crypto from "crypto";

const MERCHANT_ID = process.env.PAYTR_MERCHANT_ID!;
const MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY!;
const MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT!;
const TEST_MODE = process.env.PAYTR_TEST_MODE ?? "1";

export interface PaytrInitRequest {
  merchantOid: string;
  email: string;
  paymentAmount: number; // kuruş cinsinden (TRY × 100)
  userIp: string;
  userName: string;
  userAddress: string;
  basketItems: Array<{ name: string; price: string; quantity: number }>;
  okUrl: string;
  failUrl: string;
}

export interface PaytrInitResult {
  status: "success" | "failed";
  token?: string;
  reason?: string;
}

export async function initPaytrPayment(req: PaytrInitRequest): Promise<PaytrInitResult> {
  const basket = Buffer.from(
    JSON.stringify(req.basketItems.map((i) => [i.name, i.price, i.quantity]))
  ).toString("base64");

  const hashStr =
    MERCHANT_ID +
    req.userIp +
    req.merchantOid +
    req.email +
    String(req.paymentAmount) +
    "TL" +
    "0" +
    "0" +
    basket +
    TEST_MODE;

  const paytrToken = crypto
    .createHmac("sha256", MERCHANT_KEY)
    .update(hashStr + MERCHANT_SALT)
    .digest("base64");

  const params = new URLSearchParams({
    merchant_id: MERCHANT_ID,
    user_ip: req.userIp,
    merchant_oid: req.merchantOid,
    email: req.email,
    payment_amount: String(req.paymentAmount),
    currency: "TL",
    test_mode: TEST_MODE,
    no_installment: "0",
    max_installment: "0",
    user_name: req.userName,
    user_address: req.userAddress,
    user_phone: "05000000000",
    user_basket: basket,
    debug_on: TEST_MODE,
    merchant_ok_url: req.okUrl,
    merchant_fail_url: req.failUrl,
    paytr_token: paytrToken,
  });

  const res = await fetch("https://www.paytr.com/odeme/api/get-token", {
    method: "POST",
    body: params,
  });

  return res.json() as Promise<PaytrInitResult>;
}

export function verifyCallbackHash(
  merchantOid: string,
  status: string,
  totalAmount: string,
  receivedHash: string
): boolean {
  const expected = crypto
    .createHmac("sha256", MERCHANT_KEY)
    .update(merchantOid + MERCHANT_SALT + status + totalAmount)
    .digest("base64");
  return expected === receivedHash;
}
