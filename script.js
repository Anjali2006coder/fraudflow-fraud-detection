 const transactions = [
    {
        id: "TX-1001",
        amount: 50000,
        from: "ACC-1024",
        to: "ACC-7812"
    },
    {
        id: "TX-1002",
        amount: 47500,
        from: "ACC-7812",
        to: "ACC-9917"
    },
    {
        id: "TX-1003",
        amount: 180000,
        from: "ACC-9917",
        to: "ACC-4451"
    },
    {
        id: "TX-1004",
        amount: 12500,
        from: "ACC-2031",
        to: "ACC-1024"
    }
];

const transactionCount =
    document.getElementById("transactionCount");

const flaggedCount =
    document.getElementById("flaggedCount");

const accountCount =
    document.getElementById("accountCount");


/* =========================
   DASHBOARD UPDATE
========================= */

function updateDashboard(data) {

    if (!data || data.length === 0) {
        return;
    }

    transactionCount.textContent =
        data.length.toLocaleString();

    const flagged = data.filter(transaction => {
        return Number(transaction.amount) >= 100000;
    });

    flaggedCount.textContent = flagged.length;

    const accounts = new Set();

    data.forEach(transaction => {

        if (transaction.from) {
            accounts.add(transaction.from);
        }

        if (transaction.to) {
            accounts.add(transaction.to);
        }
    });

    accountCount.textContent = accounts.size;

    updateStatus(data.length, flagged.length);
}


/* =========================
   STATUS MESSAGE
========================= */

function updateStatus(total, flagged) {

    const statusText =
        document.querySelector(".scan-info p");

    if (statusText) {
        statusText.textContent =
            `${total} transactions analyzed. ` +
            `${flagged} transactions require investigation.`;
    }

    const scanTime =
        document.querySelector(".scan-time");

    if (scanTime) {
        scanTime.textContent = "Updated just now";
    }
}


/* =========================
   CSV IMPORT
========================= */

function handleFile(event) {

    const file = event.target.files[0];

    if (!file) {
        return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
        alert("Please select a CSV file.");
        return;
    }

    const reader = new FileReader();

    reader.onload = function () {

        const text = reader.result.trim();

        if (!text) {
            alert("The CSV file is empty.");
            return;
        }

        const rows = text
            .split(/\r?\n/)
            .map(row => row.trim())
            .filter(row => row.length > 0);

        if (rows.length < 2) {
            alert("The CSV file does not contain enough data.");
            return;
        }

        const headers = rows[0]
            .split(",")
            .map(header =>
                header.trim().toLowerCase()
            );

        const importedData = [];

        for (let i = 1; i < rows.length; i++) {

            const values = rows[i].split(",");

            const transaction = {};

            headers.forEach((header, index) => {

                transaction[header] =
                    values[index]
                        ? values[index].trim()
                        : "";
            });

            importedData.push(transaction);
        }

        processImportedData(importedData);
    };

    reader.onerror = function () {
        alert("Unable to read the CSV file.");
    };

    reader.readAsText(file);
}


/* =========================
   PROCESS IMPORTED DATA
========================= */

function processImportedData(data) {

    if (!data || data.length === 0) {
        alert("No transaction data found.");
        return;
    }

    const firstRow = data[0];

    const amountField =
        Object.keys(firstRow).find(key =>
            key.includes("amount") ||
            key.includes("value")
        );

    const fromField =
        Object.keys(firstRow).find(key =>
            key.includes("from") ||
            key.includes("sender")
        );

    const toField =
        Object.keys(firstRow).find(key =>
            key.includes("to") ||
            key.includes("receiver")
        );


    const flagged = data.filter(row => {

        if (!amountField) {
            return false;
        }

        const amount =
            Number(
                String(row[amountField])
                    .replace(/[^0-9.-]/g, "")
            );

        return amount >= 100000;
    });


    transactionCount.textContent =
        data.length.toLocaleString();

    flaggedCount.textContent =
        flagged.length;


    const accounts = new Set();

    data.forEach(row => {

        if (fromField && row[fromField]) {
            accounts.add(row[fromField]);
        }

        if (toField && row[toField]) {
            accounts.add(row[toField]);
        }
    });

    accountCount.textContent =
        accounts.size;


    updateStatus(
        data.length,
        flagged.length
    );

    alert(
        `Analysis complete!\n\n` +
        `Transactions: ${data.length}\n` +
        `Flagged: ${flagged.length}\n` +
        `Accounts: ${accounts.size}`
    );
}


/* =========================
   SIDEBAR NAVIGATION
========================= */

document
    .querySelectorAll(".nav-item")
    .forEach(item => {

        item.addEventListener("click", function(event) {

            event.preventDefault();

            document
                .querySelectorAll(".nav-item")
                .forEach(link => {
                    link.classList.remove("active");
                });

            this.classList.add("active");
        });
    });


/* =========================
   DATE BUTTON
========================= */

const dateButton =
    document.querySelector(".date-btn");

if (dateButton) {

    dateButton.addEventListener("click", function() {

        const ranges = [
            "Last 7 days",
            "Last 30 days",
            "Last 90 days"
        ];

        const current =
            this.textContent
                .replace(" ▾", "")
                .trim();

        const currentIndex =
            ranges.indexOf(current);

        const nextIndex =
            currentIndex === -1
                ? 0
                : (currentIndex + 1) % ranges.length;

        this.textContent =
            ranges[nextIndex] + " ▾";
    });
}


/* =========================
   VIEW DETAILS BUTTONS
========================= */

document
    .querySelectorAll(".small-btn")
    .forEach(button => {

        button.addEventListener("click", function() {

            alert(
                "Investigation details are being prepared.\n\n" +
                "This section will show transaction paths, " +
                "risk factors and connected accounts."
            );
        });
    });


/* =========================
   INITIAL DASHBOARD
========================= */

updateDashboard(transactions);
