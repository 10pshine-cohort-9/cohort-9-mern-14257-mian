const request = require("supertest");
const { expect } = require("chai");
const app = require("../server");
const { pool, connectDB } = require("../config/db");

describe("Authentication API Endpoints", () => {
  const testUser = {
    name: "Mocha Tester",
    email: `test_${Date.now()}@example.com`,
    password: "securepassword123",
  };

  before(async () => {
    try {
      await connectDB();
    } catch (error) {
      console.error("Auth before hook failed:", error);
      throw error;
    }
  });

  it("should successfully register a new user", async () => {
    try {
      const res = await request(app).post("/api/auth/signup").send(testUser);
      expect(res.status).to.equal(201);
      expect(res.headers["set-cookie"]).to.exist;
      expect(res.headers["set-cookie"][0]).to.include("archive_token");
      expect(res.body).to.not.have.property("token");
    } catch (error) {
      throw error;
    }
  });

  it("should return 400 when registering with an existing email", async () => {
    try {
      const res = await request(app).post("/api/auth/signup").send(testUser);
      expect(res.status).to.equal(400);
    } catch (error) {
      throw error;
    }
  });

  it("should successfully log in the user", async () => {
    try {
      const res = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });
      expect(res.status).to.equal(200);
      expect(res.headers["set-cookie"]).to.exist;
      expect(res.headers["set-cookie"][0]).to.include("archive_token");
    } catch (error) {
      throw error;
    }
  });

  it("should return 401 for invalid login credentials", async () => {
    try {
      const res = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: "wrongpassword",
      });
      expect(res.status).to.equal(401);
    } catch (error) {
      throw error;
    }
  });
});
