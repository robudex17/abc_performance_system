// routes/sales_target_shipok_routes.js
const express = require('express');
const router = express.Router();

const { validateMonthYear } = require('../middleware/validator');
const salesTargetShipokController = require('../controllers/sales_target_shipok_controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// 👇 Export a function that accepts `io`
module.exports = (io) => {
  
  router.post(
    '/agent_target_shipok/:agent_id',
    authenticateToken,
    authorizeRoles('admin', 'manager'),
    (req, res) => salesTargetShipokController.addAgentNewTarget(req, res, io)
  );

  router.get(
    '/agent_target_shipok/:agent_id',
    authenticateToken,
    validateMonthYear,
    salesTargetShipokController.fetchAgentTarget
  );

  router.put(
    '/agent_target_shipok/:agent_id',
    authenticateToken,
    authorizeRoles('admin', 'manager'),
    (req, res) => salesTargetShipokController.updateAgentTarget(req, res, io)
  );

  router.delete(
    '/agent_target_shipok/:agent_id',
    authenticateToken,
    authorizeRoles('admin', 'manager'),
    salesTargetShipokController.deleteAgentTarget
  );

  return router;
};
