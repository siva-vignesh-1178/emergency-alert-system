const responders = [];

// Register responder
const createResponder = (req, res) => {
    const { name, phone, location } = req.body;

    if (!name || !phone || !location) {
        return res.status(400).json({
            success: false,
            message: "Name, phone and location are required"
        });
    }

    const newResponder = {
        id: responders.length + 1,
        name,
        phone,
        location,
        status: "AVAILABLE"
    };

    responders.push(newResponder);

    res.status(201).json({
        success: true,
        message: "Responder registered successfully",
        responder: newResponder
    });
};

// Get all responders
const getResponders = (req, res) => {
    res.status(200).json({
        success: true,
        count: responders.length,
        responders
    });
};

// Update responder status
const updateResponderStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const responder = responders.find(
        responder => responder.id === Number(id)
    );

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

    responder.status = status;

    res.status(200).json({
        success: true,
        message: "Responder status updated successfully",
        responder
    });
};

module.exports = {
    createResponder,
    getResponders,
    updateResponderStatus
};