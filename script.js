const scanButton = document.querySelector("#scanButton");
const fileInput = document.querySelector("#fileInput");
const scanMessage = document.querySelector("#scanMessage");

const totalTransactions = document.querySelector("#totalTransactions");
const flaggedTransactions = document.querySelector("#flaggedTransactions");
const totalAmount = document.querySelector("#totalAmount");
const riskLevel = document.querySelector("#riskLevel");

const caseList = document.querySelector("#caseList");

let transactions = [];


/* -----------------------------
   SAMPLE TRANSACTION DATA
----------------------------- */

const sampleTransactions = [
    {
        id: "TXN-1042",
        from: "ACC-4821",
        to: "ACC-9182",
        amount: 48000,
        time: "10:42 AM",
        risk: "HIGH"
    },
    {
        id: "TXN-1043",
        from: "ACC-9182",
        to: "ACC-7731",
        amount: 47000,
        time: "10:45 AM",
        risk: "HIGH"
    },
    {
        id: "TXN-1044",
        from: "ACC-7731",
        to: "ACC-6620",
        amount: 45000,
        time: "10:51 AM",
        risk: "MEDIUM"
    },
    {
        id: "TXN-1045",
        from: "ACC-3210",
        to: "ACC-5512",
        amount: 8500,
        time: "11:12 AM",
        risk: "LOW"
    }
];


/* -----------------------------
   INITIAL LOAD
----------------------------- */

document.addEventListener("DOMContentLoaded", () => {
    transactions = [...sampleTransactions];

    updateDashboard();
    renderCases();
});


/* -----------------------------
   CSV FILE IMPORT
----------------------------- */

if (scanButton) {
    scanButton.addEventListener("click", () => {

        if (fileInput) {
            fileInput.click();
        }
    });
}


if (fileInput) {

    fileInput.addEventListener("change", (event) => {

        const file = event.target.files[0];

        if (!file) {
            return;
        }

        if (!file.name.toLowerCase().endsWith(".csv")) {

            showMessage(
                "Please select a CSV transaction file.",
                "error"
            );

            return;
        }

        readCSV(file);
    });
}


/* -----------------------------
   READ CSV
----------------------------- */

function readCSV(file) {

    showMessage("Scanning transaction data...", "loading");

    const reader = new FileReader();

    reader.onload = function (event) {

        const csvText = event.target.result;

        try {

            const importedData = parseCSV(csvText);

            if (importedData.length === 0) {

                showMessage(
                    "No valid transactions found.",
                    "error"
                );

                return;
            }

            transactions = importedData;

            updateDashboard();
            renderCases();

            showMessage(
                `${importedData.length} transactions scanned successfully.`,
                "success"
            );

        } catch (error) {

            console.error(error);

            showMessage(
                "Unable to read this CSV file.",
                "error"
            );
        }
    };

    reader.readAsText(file);
}


/* -----------------------------
   CSV PARSER
----------------------------- */

function parseCSV(text) {

    const lines = text
        .trim()
        .split(/\r?\n/);

    if (lines.length < 2) {
        return [];
    }

    const headers = lines[0]
        .split(",")
        .map(header => header.trim().toLowerCase());

    const result = [];

    for (let i = 1; i < lines.length; i++) {

        const values = lines[i]
            .split(",")
            .map(value => value.trim());

        if (values.length < 3) {
            continue;
        }

        const row = {};

        headers.forEach((header, index) => {
            row[header] = values[index] || "";
        });

        const amount = Number(
            row.amount ||
            row.value ||
            row.transaction_amount ||
            0
        );

        const from =
            row.from ||
            row.sender ||
            row.source ||
            "Unknown";

        const to =
            row.to ||
            row.receiver ||
            row.destination ||
            "Unknown";

        const id =
            row.id ||
            row.transaction_id ||
            `TXN-${1000 + i}`;

        const time =
            row.time ||
            row.timestamp ||
            row.date ||
            "Unknown";

        result.push({
            id: id,
            from: from,
            to: to,
            amount: amount,
            time: time,
            risk: calculateRisk(amount)
        });
    }

    return result;
}


/* -----------------------------
   BASIC RISK ENGINE
----------------------------- */

function calculateRisk(amount) {

    if (amount >= 40000) {
        return "HIGH";
    }

    if (amount >= 15000) {
        return "MEDIUM";
    }

    return "LOW";
}


/* -----------------------------
   DASHBOARD UPDATE
----------------------------- */

function updateDashboard() {

    const total = transactions.length;

    const flagged = transactions.filter(
        transaction =>
            transaction.risk === "HIGH" ||
            transaction.risk === "MEDIUM"
    ).length;

    const amount = transactions.reduce(
        (sum, transaction) =>
            sum + Number(transaction.amount || 0),
        0
    );

    const highRisk = transactions.filter(
        transaction => transaction.risk === "HIGH"
    ).length;


    if (totalTransactions) {
        totalTransactions.textContent = total;
    }

    if (flaggedTransactions) {
        flaggedTransactions.textContent = flagged;
    }

    if (totalAmount) {
        totalAmount.textContent =
            formatCurrency(amount);
    }

    if (riskLevel) {

        if (highRisk >= 3) {
            riskLevel.textContent = "CRITICAL";
        }

        else if (highRisk > 0) {
            riskLevel.textContent = "HIGH";
        }

        else if (flagged > 0) {
            riskLevel.textContent = "MEDIUM";
        }

        else {
            riskLevel.textContent = "LOW";
        }
    }
}


/* -----------------------------
   CASE LIST
----------------------------- */

function renderCases() {

    if (!caseList) {
        return;
    }

    caseList.innerHTML = "";

    const suspicious = transactions
        .filter(transaction =>
            transaction.risk !== "LOW"
        )
        .slice(0, 8);


    if (suspicious.length === 0) {

        caseList.innerHTML = `
            <div class="empty-state">
                No suspicious transactions detected.
            </div>
        `;

        return;
    }


    suspicious.forEach(transaction => {

        const caseElement =
            document.createElement("div");

        caseElement.className = "case";

        const riskClass =
            transaction.risk.toLowerCase();

        caseElement.innerHTML = `

            <div class="case-id">
                <strong>${escapeHTML(transaction.id)}</strong>
                <span>${escapeHTML(transaction.time)}</span>
            </div>

            <div class="case-info">

                <strong>
                    ${escapeHTML(transaction.from)}
                    → 
                    ${escapeHTML(transaction.to)}
                </strong>

                <span>
                    ${formatCurrency(transaction.amount)}
                </span>

            </div>

            <div class="risk-tag ${riskClass}">
                ${transaction.risk}
            </div>
        `;

        caseList.appendChild(caseElement);
    });
}


/* -----------------------------
   MESSAGE
----------------------------- */

function showMessage(message, type) {

    if (!scanMessage) {
        return;
    }

    scanMessage.textContent = message;

    scanMessage.className = `scan-message ${type}`;
}


/* -----------------------------
   CURRENCY FORMAT
----------------------------- */

function formatCurrency(value) {

    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(value);
}


/* -----------------------------
   SECURITY HELPER
----------------------------- */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
