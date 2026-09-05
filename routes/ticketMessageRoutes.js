// const express = require("express");
// const router = express.Router();

// const {
//   createMessage,
//   getMessagesByTicket,
//   updateMessage,
//   deleteMessage,
//   getFirstResponseTimeMetrics,
// } = require("../controllers/ticketController");

// // ================= TICKET MESSAGES =================

// // GET FIRST RESPONSE TIME METRICS
// // GET /api/admin/ticket-messages/metrics/first-response
// router.get(
//   "/metrics/first-response",
//   getFirstResponseTimeMetrics
// );

// // GET MESSAGES OF A TICKET
// // GET /api/admin/ticket-messages/ticket/:ticketId
// router.get(
//   "/ticket/:ticketId",
//   getMessagesByTicket
// );

// // CREATE MESSAGE
// // POST /api/admin/ticket-messages
// router.post(
//   "/",
//   createMessage
// );

// // UPDATE MESSAGE
// // PUT /api/admin/ticket-messages/:id
// router.put(
//   "/:id",
//   updateMessage
// );

// // DELETE MESSAGE
// // DELETE /api/admin/ticket-messages/:id
// router.delete(
//   "/:id",
//   deleteMessage
// );

// module.exports = router;