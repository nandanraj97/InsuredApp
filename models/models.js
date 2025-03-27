const mongoose = require("mongoose");

// Agent Schema
const agentSchema = new mongoose.Schema({
    name: String,
});

// User Schema
const userSchema = new mongoose.Schema({
    firstName: String,
    dob: String,
    address: String,
    phone: String,
    state: String,
    zipCode: String,
    email: String,
    gender: String,
    userType: String,
    city: String,
    primary: Boolean,
    applicantId: String,
    agencyId: String,
});

// Account Schema
const accountSchema = new mongoose.Schema({
    name: String,
    accountType: String,
});

// Line of Business (LOB) Schema
const lobSchema = new mongoose.Schema({
    category_name: String,
});

// Carrier Schema
const carrierSchema = new mongoose.Schema({
    company_name: String,
});

// Policy Schema
const policySchema = new mongoose.Schema({
    policyNumber: String,
    startDate: String,
    endDate: String,
    policyMode: String,
    producer: String,
    premiumAmountWritten: Number,
    premiumAmount: Number,
    policyType: String,
    csr: String,
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "LOB" },
    carrierId: { type: mongoose.Schema.Types.ObjectId, ref: "Carrier" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    hasActiveClientPolicy: Boolean,
});

// Create Models
const Agent = mongoose.model("Agent", agentSchema);
const User = mongoose.model("User", userSchema);
const Account = mongoose.model("Account", accountSchema);
const LOB = mongoose.model("LOB", lobSchema);
const Carrier = mongoose.model("Carrier", carrierSchema);
const Policy = mongoose.model("Policy", policySchema);

module.exports = { Agent, User, Account, LOB, Carrier, Policy };
