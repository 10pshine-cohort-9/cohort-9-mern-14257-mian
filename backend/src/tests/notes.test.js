const request = require("supertest");
const { expect } = require("chai");
const app = require("../server");
const { pool, connectDB } = require("../config/db");

describe("Notes API Endpoints", () => {
  let token;
  let noteId;

  const testUser = {
    name: "Note Tester",
    email: `note_tester_${Date.now()}@example.com`,
    password: "securepassword123",
  };

  before(async () => {
    await connectDB();

    await request(app).post("/api/auth/signup").send(testUser);
    const loginRes = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });
    token = loginRes.body.token;
  });

  it("should not allow unauthorized access to get notes", async () => {
    const res = await request(app).get("/api/notes");
    expect(res.status).to.equal(401);
  });

  it("should successfully create a new note", async () => {
    const res = await request(app)
      .post("/api/notes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "My First Mocha Note",
        content: "This is the test content for the note.",
      });

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property("id");
    expect(res.body.title).to.equal("My First Mocha Note");
    noteId = res.body.id;
  });

  it("should successfully retrieve all user notes", async () => {
    const res = await request(app)
      .get("/api/notes")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.be.an("array");
    expect(res.body.length).to.be.greaterThan(0);
  });

  it("should successfully update an existing note", async () => {
    const res = await request(app)
      .put(`/api/notes/${noteId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Updated Note Title",
        content: "Updated content string.",
      });

    expect(res.status).to.equal(200);
    expect(res.body.title).to.equal("Updated Note Title");
  });

  it("should successfully delete a note", async () => {
    const res = await request(app)
      .delete(`/api/notes/${noteId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("message");
  });
});
