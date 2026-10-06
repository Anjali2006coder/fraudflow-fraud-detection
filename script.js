const transactions = [
    { id: "TX-1001", amount: 50000, from: "ACC-1024", to: "ACC-7812" },
    { id: "TX-1002", amount: 47500, from: "ACC-7812", to: "ACC-9917" },
    { id: "TX-1003", amount: 180000, from: "ACC-9917", to: "ACC-4451" },
    { id: "TX-1004", amount: 12500, from: "ACC-2031", to: "ACC-1024" }
];

const transactionCount = document.getElementById("transactionCount");
const flaggedCount = document.getElementById("flaggedCount");
const accountCount = document.getElementById("accountCount");

function updateDashboard(data) {
    if (!data.length) {
        return;
    }

    transactionCount.textContent = data.length.toLocaleString();

    const flagged = data.filter(transaction => {
        return transaction.amount >= 100000;
    });

    flaggedCount.textContent = flagged.length;

    const accounts = new Set();

    data.forEach(transaction => {
        accounts.add(transaction.from);
        accounts.add(transaction.to);
    });

    accountCount.textContent = accounts.size;
}

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
        const rows = reader.result
            .trim()
            .split(/\r?\n/)
            .filter(row => row.trim() !== "");

        if (rows.length < 2) {
            alert("The CSV file does not contain enough data.");
            return;
        }

        const headers = rows[0]
            .split(",")
            .map(header => header.trim().toLowerCase());

        const importedData = [];

        for (let i = 1; i < rows.length; i++) {
            const values = rows[i].split(",");

            const transaction = {};

            headers.forEach((header, index) => {
                transaction[header] = values[index]
                    ? values[index].trim()
                    : "";
            });

            importedData.push(transaction);
        }

        processImportedData(importedData);
    };

    reader.readAsText(file);
}

function processImportedData(data) {
    const amountField = data[0]
        ? Object.keys(data[0]).find(key =>
            key.includes("amount") ||
            key.includes("value")
        )
        : null;

    const fromField = data[0]
        ? Object.keys(data[0]).find(key =>
            key.includes("from") ||
            key.includes("sender")
        )
        : null;

    const toField = data[0]
        ? Object.keys(data[0]).find(key =>
            key.includes("to") ||
            key.includes("receiver")
        )
        : null;

    const flagged = data.filter(row => {
        if (!amountField) {
            return false;
        }

        const amount = Number(
            String(row[amountField]).replace(/[^0-9.-]/g, "")
        );

        return amount >= 100000;
    });

    transactionCount.textContent = data.length.toLocaleString();
    flaggedCount.textContent = flagged.length;

    const accounts = new Set();

    data.forEach(row => {
        if (fromField && row[fromField]) {
            accounts.add(row[fromField]);
        }

        if (toField && row[toField]) {
            accounts.add(row[toField]);
        }
    });

    accountCount.textContent = accounts.size;

    showImportMessage(data.length, flagged.length);
}

function showImportMessage(total, flagged) {
    const statusText = document.querySelector(".scan-info p");

    if (!statusText) {
        return;
    }

    statusText.textContent =
        `${total.toLocaleString()} transactions analyzed. ` +
        `${flagged} transactions require investigation.`;

    const time = document.querySelector(".scan-time");

    if (time) {
        time.textContent = "Updated just now";
    }
}

document.querySelectorAll(".nav-item").forEach(item => {
    item.addEventListener("click", function (event) {
        event.preventDefault();

        document.querySelectorAll(".nav-item").forEach(link => {
            link.classList.remove("active");
        });

        this.classList.add("active");
    });
});

document.querySelector(".date-btn")?.addEventListener("click", function () {
    const ranges = [
        "Last 7 days",
        "Last 30 days",
        "Last 90 days"
    ];

    const current = this.textContent.replace(" ▾", "");
    const nextIndex = (ranges.indexOf(current) + 1) % ranges.length;

    this.textContent = ranges[nextIndex] + " ▾";
});

document.querySelectorAll(".small-btn").forEach(button => {
    button.addEventListener("click", function () {
        alert("Detailed investigation view will be available in the next version.");
    });
});

updateDashboard(transactions);
