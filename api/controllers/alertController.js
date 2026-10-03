const alerts = [];

const VALID_ALERT_STATUSES = ["ACTIVE", "PENDING", "RESOLVED", "CANCELLED"];
const VALID_ALERT_TYPES = ["FIRE", "MEDICAL", "POLICE", "NATURAL_DISASTER", "SECURITY", "OTHER"];

// Create a new emergency alert
const createAlert = (req, res, next) => {
    try {
        const { userId, type, location, description } = req.body;

        if (!userId || !type || !location) {
            return res.status(400).json({
                success: false,
                message: "userId, type and location are required"
            });
        }

        const trimmedLocation = String(location).trim();
        if (!trimmedLocation) {
            return res.status(400).json({
                success: false,
                message: "Location cannot be empty"
            });
        }

        const normalizedType = String(type).trim().toUpperCase();
        if (!normalizedType) {
            return res.status(400).json({
                success: false,
                message: "Type cannot be empty"
            });
        }

        const newAlert = {
            id: alerts.length + 1,
            userId,
            type: normalizedType,
            location: trimmedLocation,
            description: description ? String(description).trim() : "",
            status: "ACTIVE",
            createdAt: new Date().toISOString()
        };

        alerts.push(newAlert);

        return res.status(201).json({
            success: true,
            message: "Emergency alert created successfully",
            alert: newAlert
        });
    } catch (error) {
        return next(error);
    }
};

// Get all emergency alerts (with optional status filtering)
const getAlerts = (req, res, next) => {
    try {
        const { status } = req.query;

        let filteredAlerts = alerts;
        if (status) {
            const normalizedStatus = String(status).trim().toUpperCase();
            filteredAlerts = alerts.filter(alert => alert.status === normalizedStatus);
        }

        return res.status(200).json({
            success: true,
            count: filteredAlerts.length,
            alerts: filteredAlerts
        });
    } catch (error) {
        return next(error);
    }
};

// Get a single alert by ID
const getAlertById = (req, res, next) => {
    try {
        const { id } = req.params;
        const alertId = Number(id);

        if (!Number.isInteger(alertId) || alertId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid alert ID format"
            });
        }

        const alert = alerts.find(a => a.id === alertId);

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: "Alert not found"
            });
        }

        return res.status(200).json({
            success: true,
            alert
        });
    } catch (error) {
        return next(error);
    }
};

// Update alert status
const updateAlertStatus = (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const alertId = Number(id);
        if (!Number.isInteger(alertId) || alertId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid alert ID format"
            });
        }

        const alert = alerts.find(a => a.id === alertId);

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: "Alert not found"
            });
        }

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required"
            });
        }

        const normalizedStatus = String(status).trim().toUpperCase();
        if (!VALID_ALERT_STATUSES.includes(normalizedStatus)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Allowed values: ${VALID_ALERT_STATUSES.join(", ")}`
            });
        }

        alert.status = normalizedStatus;
        alert.updatedAt = new Date().toISOString();

        return res.status(200).json({
            success: true,
            message: "Alert status updated successfully",
            alert
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    createAlert,
    getAlerts,
    getAlertById,
    updateAlertStatus,
    VALID_ALERT_STATUSES,
    VALID_ALERT_TYPES
};