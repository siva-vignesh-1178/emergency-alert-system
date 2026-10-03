const responders = [];

const VALID_RESPONDER_STATUSES = ["AVAILABLE", "ON_DUTY", "DISPATCHED", "BUSY", "OFFLINE"];
const PHONE_REGEX = /^\+?[0-9\s\-()]{7,20}$/;

// Register responder
const createResponder = (req, res, next) => {
    try {
        const { name, phone, location } = req.body;

        if (!name || !phone || !location) {
            return res.status(400).json({
                success: false,
                message: "Name, phone and location are required"
            });
        }

        const trimmedName = String(name).trim();
        const trimmedPhone = String(phone).trim();
        const trimmedLocation = String(location).trim();

        if (!trimmedName) {
            return res.status(400).json({
                success: false,
                message: "Name cannot be empty"
            });
        }

        if (!PHONE_REGEX.test(trimmedPhone)) {
            return res.status(400).json({
                success: false,
                message: "Invalid phone number format"
            });
        }

        if (!trimmedLocation) {
            return res.status(400).json({
                success: false,
                message: "Location cannot be empty"
            });
        }

        const newResponder = {
            id: responders.length + 1,
            name: trimmedName,
            phone: trimmedPhone,
            location: trimmedLocation,
            status: "AVAILABLE",
            createdAt: new Date().toISOString()
        };

        responders.push(newResponder);

        return res.status(201).json({
            success: true,
            message: "Responder registered successfully",
            responder: newResponder
        });
    } catch (error) {
        return next(error);
    }
};

// Get all responders (with optional status filtering)
const getResponders = (req, res, next) => {
    try {
        const { status } = req.query;

        let filteredResponders = responders;
        if (status) {
            const normalizedStatus = String(status).trim().toUpperCase();
            filteredResponders = responders.filter(r => r.status === normalizedStatus);
        }

        return res.status(200).json({
            success: true,
            count: filteredResponders.length,
            responders: filteredResponders
        });
    } catch (error) {
        return next(error);
    }
};

// Get single responder by ID
const getResponderById = (req, res, next) => {
    try {
        const { id } = req.params;
        const responderId = Number(id);

        if (!Number.isInteger(responderId) || responderId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid responder ID format"
            });
        }

        const responder = responders.find(r => r.id === responderId);

        if (!responder) {
            return res.status(404).json({
                success: false,
                message: "Responder not found"
            });
        }

        return res.status(200).json({
            success: true,
            responder
        });
    } catch (error) {
        return next(error);
    }
};

// Update responder status
const updateResponderStatus = (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const responderId = Number(id);
        if (!Number.isInteger(responderId) || responderId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid responder ID format"
            });
        }

        const responder = responders.find(r => r.id === responderId);

        if (!responder) {
            return res.status(404).json({
                success: false,
                message: "Responder not found"
            });
        }

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required"
            });
        }

        const normalizedStatus = String(status).trim().toUpperCase();
        if (!VALID_RESPONDER_STATUSES.includes(normalizedStatus)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Allowed values: ${VALID_RESPONDER_STATUSES.join(", ")}`
            });
        }

        responder.status = normalizedStatus;
        responder.updatedAt = new Date().toISOString();

        return res.status(200).json({
            success: true,
            message: "Responder status updated successfully",
            responder
        });
    } catch (error) {
        return next(error);
    }
};

module.exports = {
    createResponder,
    getResponders,
    getResponderById,
    updateResponderStatus,
    VALID_RESPONDER_STATUSES
};