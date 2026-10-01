const alerts = [];

// Create a new emergency alert
const createAlert = (req, res) => {
    const { userId, type, location, description } = req.body;

    if (!userId || !type || !location) {
        return res.status(400).json({
            success: false,
            message: "userId, type and location are required"
        });
    }

    const newAlert = {
        id: alerts.length + 1,
        userId,
        type,
        location,
        description: description || "",
        status: "ACTIVE"
    };

    alerts.push(newAlert);

    res.status(201).json({
        success: true,
        message: "Emergency alert created successfully",
        alert: newAlert
    });
};

// Get all emergency alerts
const getAlerts = (req, res) => {
    res.status(200).json({
        success: true,
        count: alerts.length,
        alerts
    });
};

// Update alert status
const updateAlertStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const alert = alerts.find(alert => alert.id === Number(id));

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

    alert.status = status;

    res.status(200).json({
        success: true,
        message: "Alert status updated successfully",
        alert
    });
};

module.exports = {
    createAlert,
    getAlerts,
    updateAlertStatus
};