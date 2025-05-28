class ExpressError extends Error {
    constructor(message, status) {
        super();
        this.message = message;
        this.status = status;
    }
}

//Here Error is the native build in class

module.exports = ExpressError;