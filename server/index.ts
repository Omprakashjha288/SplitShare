import express from "express";
import cors from "cors";
import { prisma } from "./prisma";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send(`
    <html>
      <body style="font-family:monospace;padding:40px;background:#0f0f0f;color:#e2e8f0;">
        <h2 style="color:#a855f7">⚡ SplitShare API — Running</h2>
        <p style="color:#94a3b8">Backend is healthy. Open the frontend at <a href="http://localhost:5173" style="color:#a855f7">localhost:5173</a></p>
        <hr style="border-color:#333;margin:24px 0"/>
        <p style="color:#64748b">Available endpoints:</p>
        <ul style="color:#94a3b8;line-height:2">
          <li>GET /api/health</li>
          <li>GET /api/dashboard</li>
          <li>GET /api/stats</li>
          <li>GET /api/imports</li>
          <li>GET /api/settlements</li>
          <li>POST /api/import</li>
        </ul>
      </body>
    </html>
  `);
});

app.get("/api/health", async (_req, res) => {
  try {
    const users = await prisma.user.count();
    const expenses = await prisma.expense.count();

    res.json({
      success: true,
      users,
      expenses,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: "Health check failed",
    });
  }
});


app.post("/api/import", async (req, res) => {
  console.log("IMPORT HIT");
  console.log("Rows received:", req.body.rows?.length);

  try {
    const rows = req.body.rows;
    const filename = req.body.filename || "unknown.csv";
    const flagged = req.body.flagged ?? 0;

    const group = await prisma.group.upsert({
      where: {
        name: "Shared Expense Group",
      },
      update: {},
      create: {
        name: "Shared Expense Group",
      },
    });

    let imported = 0;
    let skipped = 0;

    for (const row of rows) {
      if (!row.paid_by) {
        skipped++;
        continue;
      }

      // Robust amount parsing — strips ₹, commas, whitespace
      const amount = parseFloat(
        String(row.amount || "0")
          .replace(/,/g, "")
          .replace(/₹/g, "")
          .trim()
      );

      if (isNaN(amount) || amount === 0) {
        console.log(`Skipping row — invalid amount: "${row.amount}" | ${row.description}`);
        skipped++;
        continue;
      }

      const email = `${row.paid_by
        .toLowerCase()
        .replace(/\s+/g, "")}@demo.com`;

      const user = await prisma.user.upsert({
        where: {
          email,
        },
        update: {},
        create: {
          name: row.paid_by,
          email,
          passwordHash: "temp123",
        },
      });

      // Parse date from CSV — handle DD-MM-YYYY, DD/MM/YYYY, and ISO formats
      let expenseDate = new Date();
      if (row.date) {
        const raw = String(row.date).trim();
        // Try DD-MM-YYYY or DD/MM/YYYY
        const ddmmyyyy = raw.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
        if (ddmmyyyy) {
          expenseDate = new Date(`${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2,"0")}-${ddmmyyyy[1].padStart(2,"0")}`);
        } else {
          const parsed = new Date(raw);
          if (!isNaN(parsed.getTime())) expenseDate = parsed;
        }
        if (isNaN(expenseDate.getTime())) expenseDate = new Date();
      }

      await prisma.expense.create({
        data: {
          description: row.description || "No Description",
          amount,
          amountInr: amount,
          currency: row.currency || "INR",
          splitType: row.split_type || "equal",
          date: expenseDate,
          paidById: user.id,
          groupId: group.id,
        },
      });

      imported++;
    }

    // Save import log to DB so history page updates
    await prisma.importLog.create({
      data: {
        filename,
        totalRows: rows.length,
        imported,
        skipped,
        flagged,
        anomalies: [],
      },
    });

    res.json({
      success: true,
      imported,
      skipped,
    });

  } catch (error: any) {
    console.error("IMPORT ERROR:");
    console.error(error);

    res.status(500).json({
      success: false,
      message: error?.message,
    });
  }
});

app.get("/api/dashboard", async (_req, res) => {
  try {
    const totalUsers = await prisma.user.count();

    const totalExpenses = await prisma.expense.aggregate({
      _sum: {
        amountInr: true,
      },
    });

    const totalGroups = await prisma.group.count();
    const totalImports = await prisma.importLog.count();
    const totalExpensesCount = await prisma.expense.count();
    const totalExpenseRecords = totalExpensesCount;

    const topSpenders = await prisma.expense.groupBy({
      by: ["paidById"],
      _sum: {
        amountInr: true,
      },
    });

    // Map topSpenders to include user names
    const userList = await prisma.user.findMany({
      where: {
        id: { in: topSpenders.map((s) => s.paidById) },
      },
    });

    const mappedSpenders = topSpenders
      .map((s) => {
        const u = userList.find((usr) => usr.id === s.paidById);
        return {
          paidById: s.paidById,
          name: u?.name || "Unknown",
          amountInr: s._sum.amountInr || 0,
        };
      })
      .sort((a, b) => Number(b.amountInr) - Number(a.amountInr));

    const recentExpenses = await prisma.expense.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        paidBy: true,
      },
    });

    const recentImports = await prisma.importLog.findMany({
      take: 5,
      orderBy: {
        importedAt: "desc",
      },
    });

    // Aggregate monthly spending
    const allExpenses = await prisma.expense.findMany({
      select: {
        date: true,
        amountInr: true,
      },
    });

    const monthlyDataMap: Record<string, number> = {};
    for (const exp of allExpenses) {
      const d = new Date(exp.date);
      if (isNaN(d.getTime())) continue;
      const monthStr = d.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      }); // e.g. "Feb 26"
      monthlyDataMap[monthStr] =
        (monthlyDataMap[monthStr] || 0) + Number(exp.amountInr || 0);
    }

    const monthlySpending = Object.entries(monthlyDataMap)
      .map(([month, amount]) => ({
        month,
        amount,
      }))
      .sort((a, b) => {
        const dateA = new Date(a.month.replace(" ", " 20"));
        const dateB = new Date(b.month.replace(" ", " 20"));
        return dateA.getTime() - dateB.getTime();
      });

    res.json({
      totalUsers,
      totalExpense: totalExpenses._sum.amountInr || 0,
      totalExpenses: totalExpensesCount,
      totalGroups,
      totalImports,
      topSpenders: mappedSpenders,
      recentExpenses,
      recentImports,
      monthlySpending,
    });
  } catch (error: any) {
    console.error("DASHBOARD ERROR:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to fetch dashboard data",
    });
  }
});

app.get("/api/stats", async (_req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalExpenses = await prisma.expense.count();
    const totalImports = await prisma.importLog.count();

    const expenseSum = await prisma.expense.aggregate({
      _sum: {
        amountInr: true,
      },
    });

    res.json({
      totalUsers,
      totalExpenses,
      totalImports,
      totalAmount: expenseSum._sum.amountInr || 0,
    });
  } catch (error: any) {
    console.error("STATS ERROR:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to fetch stats data",
    });
  }
});

app.get("/api/imports", async (_req, res) => {
  try {
    const logs = await prisma.importLog.findMany({
      orderBy: {
        importedAt: "desc",
      },
    });
    res.json(logs);
  } catch (error: any) {
    console.error("IMPORTS HISTORY ERROR:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to fetch import logs",
    });
  }
});

app.get("/api/settlements", async (_req, res) => {
  try {
    const users = await prisma.user.findMany();
    const expenses = await prisma.expense.findMany({
      include: { splits: true },
    });

    // net balance: positive = creditor (paid more than owed), negative = debtor
    const balances: Record<string, number> = {};
    for (const user of users) balances[user.id] = 0;

    const n = users.length;

    for (const expense of expenses) {
      const total = Number(expense.amountInr);

      // Check if splits exist — if so use them, else assume equal split among all users
      if (expense.splits.length > 0) {
        balances[expense.paidById] += total;
        for (const split of expense.splits) {
          if (balances[split.userId] !== undefined) {
            balances[split.userId] -= Number(split.amount);
          }
        }
      } else {
        // Equal split among all users
        const share = total / n;
        balances[expense.paidById] += total;
        for (const user of users) {
          balances[user.id] -= share;
        }
      }
    }

    // Build creditor/debtor lists
    const creditors: { userId: string; name: string; amount: number }[] = [];
    const debtors: { userId: string; name: string; amount: number }[] = [];

    for (const user of users) {
      const bal = Math.round(balances[user.id] * 100) / 100;
      if (bal > 0.01) {
        creditors.push({ userId: user.id, name: user.name, amount: bal });
      } else if (bal < -0.01) {
        debtors.push({ userId: user.id, name: user.name, amount: Math.abs(bal) });
      }
    }

    // Minimum cash flow: greedy settle largest debtor with largest creditor
    const transactions: { from: string; to: string; amount: number }[] = [];
    const cred = creditors.map((c) => ({ ...c }));
    const debt = debtors.map((d) => ({ ...d }));

    cred.sort((a, b) => b.amount - a.amount);
    debt.sort((a, b) => b.amount - a.amount);

    let ci = 0;
    let di = 0;
    while (ci < cred.length && di < debt.length) {
      const settle = Math.min(cred[ci].amount, debt[di].amount);
      settle > 0.01 &&
        transactions.push({
          from: debt[di].name,
          to: cred[ci].name,
          amount: Math.round(settle * 100) / 100,
        });
      cred[ci].amount -= settle;
      debt[di].amount -= settle;
      if (cred[ci].amount < 0.01) ci++;
      if (debt[di].amount < 0.01) di++;
    }

    res.json({ creditors, debtors, transactions });
  } catch (error: any) {
    console.error("SETTLEMENTS ERROR:", error);
    res.status(500).json({ success: false, message: error?.message });
  }
});

app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});