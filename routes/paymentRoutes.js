const express = require("express");
const router = express.Router();

const { subscriptionPlan, paymentSuccess, paymentCancel, billingPortal, webhookFunctions } = require("../controllers/paymentController");

router.route("/subscribe").get( subscriptionPlan );
router.route("/success").get( paymentSuccess );
router.route("/cancel").get( paymentCancel );
router.route("/customer/:customerId").get( billingPortal );
router.route("/webhook").post( express.raw({ type: 'application/json' }), webhookFunctions );

module.exports = router;