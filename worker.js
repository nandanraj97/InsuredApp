const { parentPort, workerData } = require("worker_threads");
const xlsx = require("xlsx");
const fs = require("fs");
const mongoose = require("mongoose");
const { Agent, User, Account, LOB, Carrier, Policy } = require("./models/models");

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected in Worker Thread"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

async function processFile(filePath) {

    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    console.log(`📝 Found ${data.length} records in the Excel file.`);

    for (let row of data) {

        try {
            // Insert or update Agent
            const agent = await Agent.findOneAndUpdate(
                { name: row["agent"] },
                { name: row["agent"] },
                { upsert: true, new: true }
            );

            // Insert or update User
            const user = await User.findOneAndUpdate(
                { firstName: row["firstname"], email: row["email"] },
                {
                    firstName: row["firstname"],
                    dob: row["dob"],
                    address: row["address"],
                    phone: row["phone"],
                    state: row["state"],
                    zipCode: row["zip"],
                    email: row["email"],
                    gender: row["gender"],
                    userType: row["userType"],
                    city: row["city"],
                    primary: row["primary"] === "Yes", 
                    applicantId: row["Applicant ID"],
                    agencyId: row["agency_id"],
                },
                { upsert: true, new: true }
            );

            // Insert or update Account
            const account = await Account.findOneAndUpdate(
                { name: row["account_name"] },
                { name: row["account_name"], accountType: row["account_type"] },
                { upsert: true, new: true }
            );

            // Insert or update LOB
            const lob = await LOB.findOneAndUpdate(
                { category_name: row["category_name"] },
                { category_name: row["category_name"] },
                { upsert: true, new: true }
            );

            // Insert or update Carrier
            const carrier = await Carrier.findOneAndUpdate(
                { company_name: row["company_name"] },
                { company_name: row["company_name"] },
                { upsert: true, new: true }
            );

            // Insert Policy
            const policy = await Policy.create({
                policyNumber: row["policy_number"],
                startDate: row["policy_start_date"],
                endDate: row["policy_end_date"],
                policyMode: row["policy_mode"],
                producer: row["producer"],
                premiumAmountWritten: parseFloat(row["premium_amount_written"]) || 0,
                premiumAmount: parseFloat(row["premium_amount"]) || 0,
                policyType: row["policy_type"],
                csr: row["csr"],
                categoryId: lob._id,
                carrierId: carrier._id,
                userId: user._id,
                hasActiveClientPolicy: row["hasActive ClientPolicy"] === "Yes", 
            });

        } catch (error) {
            console.error("Error inserting record:", error);
        }
    }

    fs.unlinkSync(filePath);
    parentPort.postMessage({ status: "success", records: data.length });
}

// Start processing
processFile(workerData).catch(err => {
    console.error("Worker Thread Error:", err);
    parentPort.postMessage({ error: err.message });
});
