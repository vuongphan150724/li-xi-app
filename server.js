const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const totalMoneyLimit = 5000000;
const luckyAmounts = [100000, 200000, 500000];

const dataFile = path.join(__dirname, "data.json");

if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, "[]");
}

function readData() {
    try {
        const raw = fs.readFileSync(dataFile);
        return JSON.parse(raw || "[]");
    } catch (err) {
        return [];
    }
}

function saveData(data) {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

app.post("/api/receive", (req, res) => {
    try {
        const { name } = req.body;

        if (!name || name.trim() === "") {
            return res.json({ success: false, payload: null, error: "Vui lòng nhập tên!" });
        }

        let data = readData();

        if (data.find(u => u.name === name.trim())) {
            return res.json({ success: false, payload: null, error: "Bạn đã nhận rồi!" });
        }

        const totalGiven = data.reduce((sum, u) => sum + u.money, 0);

        let money = luckyAmounts[Math.floor(Math.random() * luckyAmounts.length)];

        if (totalGiven + money > totalMoneyLimit) {
            return res.json({ success: false, payload: null, error: "Hết tiền lì xì!" });
        }

        const defaultMessage =
            `Chúc ${name.trim()} năm mới thật nhiều may mắn, nhiều tài lộc 🎉. ` +
            `Đặc biệt luôn dồi dào sức khỏe 💪 và trọn vẹn hạnh phúc nha ❤️`;

        const user = {
            name: name.trim(),
            money,
            message: defaultMessage,
            time: Date.now()
        };

        data.push(user);
        saveData(data);

        return res.json({ success: true, payload: user, error: null });

    } catch (err) {
        return res.status(500).json({ success: false, payload: null, error: "Lỗi server" });
    }
});

app.get("/api/list", (req, res) => {
    const data = readData();
    return res.json({ success: true, payload: data, error: null });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Server chạy tại port " + PORT);
});
