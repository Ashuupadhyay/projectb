const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/support_admin_db';

async function seedData() {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB for seeding...");

    const db = mongoose.connection.db;

    // Purana data clear karein
    await db.collection('users').deleteMany({});
    await db.collection('supporttickets').deleteMany({});
    await db.collection('ticketmessages').deleteMany({});

    // 1. Customer aur Agent Users (Unique Mobile Numbers ke sath)
    const customerRes = await db.collection('users').insertOne({
      name: "Rahul Sharma",
      email: "rahul@example.com",
      mobile: "9876543210", // Unique mobile number added
      role: "customer",
      createdAt: new Date()
    });

    const agentRes = await db.collection('users').insertOne({
      name: "Priya Singh",
      email: "priya@support.com",
      mobile: "9876543211", // Unique mobile number added
      role: "agent",
      createdAt: new Date()
    });

    const customerId = customerRes.insertedId;
    const agentId = agentRes.insertedId;

    // 2. Sample Support Tickets Banayein
    const oldDate = new Date();
    oldDate.setHours(oldDate.getHours() - 30); // 30 ghante purana ticket (SLA breach test karne ke liye)

    await db.collection('supporttickets').insertMany([
      {
        ticketId: "TCK-1001",
        customerId: customerId,
        assignedAgentId: agentId,
        subject: "Payment deducted twice for subscription",
        category: "billing",
        priority: "urgent",
        status: "open",
        createdAt: oldDate,
        updatedAt: oldDate
      },
      {
        ticketId: "TCK-1002",
        customerId: customerId,
        assignedAgentId: agentId,
        subject: "Cannot update profile picture in settings",
        category: "technical",
        priority: "medium",
        status: "in_progress",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    console.log("✅ Seed Data Successfully Inserted!");
    process.exit(0);
  } catch (err) {
    console.error("Error Seeding Data:", err);
    process.exit(1);
  }
}

seedData();