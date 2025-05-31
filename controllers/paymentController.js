const asyncHandler = require("express-async-handler");
require("dotenv").config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

//subscriptionPlan
const subscriptionPlan = asyncHandler(async (req, res) => {
  console.log("9999", req.query.plan);

  const plan = req.query.plan;

  if (!plan) {
    return res.send("Plan not found");
  }

  let priceId;

  switch (plan.toLowerCase()) {
    case "starter":
      priceId = "price_1PxSIhDyuKqLci7Ueu0PU9lB";
      break;

    case "lite":
      priceId = "price_1PxSJXDyuKqLci7UaAMh8rwp";
      break;

    default:
      return res.status(400).send("Plan not found , switch case error");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url:
      "https://mediamate-backend.onrender.com/api/users/payments/success?session_id={CHECKOUT_SESSION_ID}",
    cancel_url: "https://mediamate-backend.onrender.com/api/users/payments/cancel",
  });

  return res.status(200).json(session);
});

// payment success
const paymentSuccess = asyncHandler(async (req, res) => {
  // const session = await stripe.checkout.sessions.retrieve(
  //   req.query.session_id,
  //   { expand: ["subscription", "subscription.plan.product"] }
  // );

  // console.log(JSON.stringify(session));

  return res.status(200).send("Subscribed successfully");
});

// cancel
const paymentCancel = asyncHandler(async (req, res) => {
  return res.redirect("http://localhost:3000/user/premium");
});

// Billing portal
const billingPortal = asyncHandler(async (req, res) => {
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: req.params.customerId,
    return_url: "http://localhost:3000/user/premium",
  });

  return res.status(200).json(portalSession);
});

const webhookFunctions = asyncHandler(async (req, res) => {
  if (req.headers['content-type'] !== 'application/json') {
    return res.status(400).send('Invalid content type');
  }
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET_KEY
    );
  } catch (err) {

    console.log(" errro 90", err);
    
    return res.status(400).send(`Webhook Error: ${err.message}`);

  }

  // Handle the event
  switch (event.type) {
    // event when subscription started
    case 'checkout.session.completed':
      console.log("New subscription started!");
      console.log(event.data);
      break;
    // Event when payment i ssuccessfull ( every subscription interval )
    case 'invoice.paid':
      console.log("Invoice paid!");
      console.log(event.data);
      break;
    // Event wheen the payment failed due to card problems or insufficient fund( every subscription interval )
    case 'invoice.payment_failed':
        console.log("Invoice payment failed!");
        console.log(event.data);
        break;
    // Event when subscription is updated
    case 'customer.subscription.updated':
        console.log("Subscription updated!");
        console.log(event.data);
        break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).json({ received: true });
});

module.exports = {
  subscriptionPlan,
  paymentSuccess,
  paymentCancel,
  billingPortal,
  webhookFunctions,
};
