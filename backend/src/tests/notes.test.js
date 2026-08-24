const request = require("supertest");
const { expect } = require("chai");
const app = require("../server");

describe("Notes API Endpoints", () => {
  let cookie;
  let noteId;

  const testUser = {
    name: "Note Tester",
    email: `note_tester_${Date.now()}@example.com`,
    password: "securepassword123",
  };

  before(async () => {
    try {
      await request(app).post("/api/auth/signup").send(testUser);
      const loginRes = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      cookie = loginRes.headers["set-cookie"];
    } catch (error) {
      console.error("Notes test setup failed:", error.message);
      throw error;
    }
  });

  it("should not allow unauthorized access to get notes", async () => {
    try {
      const res = await request(app).get("/api/notes");
      expect(res.status).to.equal(401);
    } catch (error) {
      console.error("Unauthorized access check failed:", error.message);
      throw error;
    }
  });

  it("should successfully create a new note", async () => {
    try {
      const res = await request(app)
        .post("/api/notes")
        .set("Cookie", cookie)
        .send({
          title: "My First Mocha Note",
          content: "This is the test content for the note.",
        });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property("id");
      expect(res.body.title).to.equal("My First Mocha Note");
      noteId = res.body.id;
    } catch (error) {
      console.error("Note creation test failed:", error.message);
      throw error;
    }
  });

  it("should successfully retrieve all user notes", async () => {
    try {
      const res = await request(app).get("/api/notes").set("Cookie", cookie);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("array");
      expect(res.body.length).to.be.greaterThan(0);
    } catch (error) {
      console.error("Retrieve notes test failed:", error.message);
      throw error;
    }
  });

  it("should successfully update an existing note", async () => {
    try {
      const res = await request(app)
        .put(`/api/notes/${noteId}`)
        .set("Cookie", cookie)
        .send({
          title: "Updated Note Title",
          content: "Updated content string.",
        });

      expect(res.status).to.equal(200);
      expect(res.body.title).to.equal("Updated Note Title");
    } catch (error) {
      console.error("Update note test failed:", error.message);
      throw error;
    }
  });

  it("should successfully delete a note", async () => {
    try {
      const res = await request(app)
        .delete(`/api/notes/${noteId}`)
        .set("Cookie", cookie);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("message");
    } catch (error) {
      console.error("Delete note test failed:", error.message);
      throw error;
    }
  });
});
