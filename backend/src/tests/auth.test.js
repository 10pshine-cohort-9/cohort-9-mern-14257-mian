const request = require("supertest");
const { expect } = require("chai");
const app = require("../server");
const { pool } = require("../config/db");

describe("Authentication API Endpoints", () => {
  const testUser = {
    name: "Mocha Tester",
    email: `test_${Date.now()}@example.com`,
    password: "securepassword123",
  };

  // Connect to DB before tests run
  before(async () => {
    const connection = await pool.getConnection();
    connection.release();
  });

  it("should successfully register a new user", async () => {
    const res = await request(app).post("/api/auth/signup").send(testUser);
    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("token");
  });

  it("should return 400 when registering with an existing email", async () => {
    const res = await request(app).post("/api/auth/signup").send(testUser);
    expect(res.status).to.equal(400);
  });

  it("should successfully log in the user", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("token");
  });

  it("should return 401 for invalid login credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: "wrongpassword",
    });
    expect(res.status).to.equal(401);
  });
});
