import express from "express";
import path from "path";
import dotenv from "dotenv";
import { PrismaClient } from "../generated/prisma";

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", async (req, res) => {
	const [customerCount, staffCount, serviceCount, upcomingAppts] = await Promise.all([
		prisma.customer.count(),
		prisma.staff.count(),
		prisma.service.count(),
		prisma.appointment.findMany({
			orderBy: { startsAt: "asc" },
			take: 5,
			include: { customer: { include: { user: true } }, staff: { include: { user: true } } },
		}),
	]);
	res.render("dashboard", { customerCount, staffCount, serviceCount, upcomingAppts });
});

app.get("/customers", async (req, res) => {
	const customers = await prisma.customer.findMany({ include: { user: true } });
	res.render("customers", { customers });
});

app.get("/staff", async (req, res) => {
	const staff = await prisma.staff.findMany({ include: { user: true, skills: { include: { service: true } } } });
	res.render("staff", { staff });
});

app.get("/services", async (req, res) => {
	const categories = await prisma.serviceCategory.findMany({ include: { services: true } });
	res.render("services", { categories });
});

app.get("/appointments", async (req, res) => {
	const appointments = await prisma.appointment.findMany({
		orderBy: { startsAt: "desc" },
		include: {
			customer: { include: { user: true } },
			staff: { include: { user: true } },
			services: { include: { service: true } },
			invoice: true,
		},
	});
	res.render("appointments", { appointments });
});

app.listen(PORT, () => {
	console.log(`Web app running on http://localhost:${PORT}`);
});