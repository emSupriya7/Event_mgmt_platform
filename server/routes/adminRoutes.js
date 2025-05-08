const express = require("express");
const router = express.Router();
const {
    setAdmin,
    adminAuth,
    adminDetails,
} = require("../controllers/adminController");

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management and authentication
 */

/**
 * @swagger
 * /api/admin/setadmin:
 *   post:
 *     summary: Create a new admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       400:
 *         description: Invalid input or admin already exists
 */
router.route("/setadmin").post(setAdmin);

/**
 * @swagger
 * /api/admin/admin/auth:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Unauthorized or invalid credentials
 */
router.route("/admin/auth").post(adminAuth);

/**
 * @swagger
 * /api/admin/admin/details:
 *   post:
 *     summary: Get admin details
 *     tags: [Admin]
 *     requestBody:
 *       required: false
 *     responses:
 *       200:
 *         description: Admin details fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.route("/admin/details").post(adminDetails);

module.exports = router;
