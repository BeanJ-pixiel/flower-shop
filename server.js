require("dotenv").config();
const express = require("express");
const sql = require("mssql/msnodesqlv8");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// 1. Cấu hình kết nối SQL Server
const dbConfig = {
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,

    options: {
        trustedConnection: true,
        trustServerCertificate: true
    },

    connectionTimeout: 15000
};

let pool;

async function connectDatabase() {
    pool = await sql.connect(dbConfig);
    console.log("Đã kết nối SQL Server!");
}

// 3. API kiểm tra máy chủ
app.get("/api", (req, res) => {
    res.json({
        message: "Flower Shop API is running"
    });
});

// 4. API đăng ký
app.post("/api/auth/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ thông tin"
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Mật khẩu phải có ít nhất 8 ký tự"
            });
        }

        const existingUser = await pool
            .request()
            .input("username", sql.NVarChar(50), username)
            .input("email", sql.NVarChar(100), email)
            .query(`
                SELECT id
                FROM Users
                WHERE username = @username
                   OR email = @email
            `);

        if (existingUser.recordset.length > 0) {
            return res.status(409).json({
                message: "Tên đăng nhập hoặc email đã tồn tại"
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        // Người đăng ký luôn có role customer.
        await pool
            .request()
            .input("username", sql.NVarChar(50), username)
            .input("email", sql.NVarChar(100), email)
            .input("passwordHash", sql.NVarChar(255), passwordHash)
            .query(`
                INSERT INTO Users (
                    username,
                    email,
                    password_hash,
                    role
                )
                VALUES (
                    @username,
                    @email,
                    @passwordHash,
                    'customer'
                )
            `);

        return res.status(201).json({
            message: "Đăng ký thành công"
        });

    } catch (error) {
        console.error("Lỗi đăng ký:", error);

        return res.status(500).json({
            message: "Đã xảy ra lỗi khi đăng ký"
        });
    }
});

// 5. API đăng nhập
app.post("/api/auth/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Vui lòng nhập tên đăng nhập và mật khẩu"
            });
        }

        const result = await pool
            .request()
            .input("username", sql.NVarChar(50), username)
            .query(`
                SELECT id, username, email, password_hash, role
                FROM Users
                WHERE username = @username
            `);

        if (result.recordset.length === 0) {
            return res.status(401).json({
                message: "Tên đăng nhập hoặc mật khẩu không đúng"
            });
        }

        const user = result.recordset[0];

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Tên đăng nhập hoặc mật khẩu không đúng"
            });
        }

        // Vai trò được lấy từ SQL Server,
        // không lấy từ dữ liệu người dùng gửi lên.
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "2h"
            }
        );

        return res.json({
            message: "Đăng nhập thành công",

            token,

            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Lỗi đăng nhập:", error);

        return res.status(500).json({
            message: "Đã xảy ra lỗi khi đăng nhập"
        });
    }
});

// 6. Middleware xác thực JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Bạn cần đăng nhập"
        });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if (error) {
            return res.status(401).json({
                message: "Token không hợp lệ hoặc đã hết hạn"
            });
        }

        req.user = decoded;

        next();
    });
}

// 7. Middleware kiểm tra quyền admin
function requireAdmin(req, res, next) {
    if (req.user.role !== "admin") {
        return res.status(403).json({
            message: "Bạn không có quyền truy cập chức năng này"
        });
    }

    next();
}

// 8. API dành cho người đã đăng nhập
app.get(
    "/api/auth/me",
    authenticateToken,
    (req, res) => {
        res.json({
            message: "Xác thực thành công",
            user: req.user
        });
    }
);

// 9. API chỉ dành cho admin
app.get(
    "/api/admin/test",
    authenticateToken,
    requireAdmin,
    (req, res) => {
        res.json({
            message: "Bạn có quyền truy cập khu vực quản trị"
        });
    }
);

// 10. Khởi động máy chủ sau khi kết nối database
async function startServer() {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error("Thiếu JWT_SECRET trong file .env");
        }

        await connectDatabase();

        app.listen(PORT, () => {
            console.log(`Server đang chạy tại http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("Không thể khởi động server:", error.message);
        process.exit(1);
    }
}

startServer();