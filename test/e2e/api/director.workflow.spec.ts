import { Express } from "express";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../../src/main/app";
import { bootstrap } from "../../../src/main/bootstrap";

describe("Director API E2E Tests", () => {
  let expressApp: Express;
  let createdDirectorId: string;

  // Test data
  const testDirector = {
    firstName: "Christopher",
    secondName: "Nolan",
    bio: "British-American film director known for his cerebral, often nonlinear, storytelling.",
    birthDate: new Date("1970-07-30").toISOString(),
  };

  beforeAll(async () => {
    // Setup real app
    await bootstrap(app);
    expressApp = app;

    // Connect to test database
    await mongoose.connect(
      process.env.DATABASE_URL || "mongodb://localhost:27018/test_db"
    );
  });

  afterAll(async () => {
    // Clean up created data if test didn't delete it
    if (createdDirectorId) {
      await request(expressApp).delete(
        `/api/v1/directors/${createdDirectorId}`
      );
    }

    await mongoose.connection.close();
  });

  describe("POST /api/v1/directors", () => {
    it("should create a new director successfully", async () => {
      const response = await request(expressApp)
        .post("/api/v1/directors")
        .send(testDirector)
        .expect(201);

      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.firstName).toBe(testDirector.firstName);
      expect(response.body.data.secondName).toBe(testDirector.secondName);

      // bio and birthDate are excluded in DirectorDto
      expect(response.body.data.bio).toBeUndefined();
      expect(response.body.data.birthDate).toBeUndefined();

      // Store ID for later tests
      createdDirectorId = response.body.data.id;
    });

    it("should reject invalid director data", async () => {
      const invalidDirector = {
        firstName: "Missing",
        // Missing required fields
      };

      await request(expressApp)
        .post("/api/v1/directors")
        .send(invalidDirector)
        .expect(400);
    });
  });

  describe("DELETE /api/v1/directors/:id", () => {
    it("should delete a director successfully", async () => {
      // First create a new director to delete
      const createResponse = await request(expressApp)
        .post("/api/v1/directors")
        .send({
          firstName: "Martin",
          secondName: "Scorsese",
          bio: "American film director, producer, screenwriter and actor.",
          birthDate: new Date("1942-11-17").toISOString(),
        })
        .expect(201);

      const directorId = createResponse.body.data.id;

      // Then delete it
      await request(expressApp)
        .delete(`/api/v1/directors/${directorId}`)
        .expect(204);
    });

    it("should return 404 for deleting non-existent director", async () => {
      const fakeId = "507f1f77bcf86cd799439011"; // Valid MongoDB ObjectID that doesn't exist
      await request(expressApp)
        .delete(`/api/v1/directors/${fakeId}`)
        .expect(404);
    });

    it("should return 400 for invalid id format", async () => {
      await request(expressApp)
        .delete("/api/v1/directors/invalid-id")
        .expect(400);
    });
  });

  // Tests for director-movie relationships
  describe("Director-Movie Relationships", () => {
    let movieId: string;

    beforeAll(async () => {
      if (!createdDirectorId) {
        // Create a director if not already created
        const createResponse = await request(expressApp)
          .post("/api/v1/directors")
          .send(testDirector)
          .expect(201);

        createdDirectorId = createResponse.body.data.id;
      }
    });

    afterAll(async () => {
      if (createdDirectorId) {
        await request(expressApp).delete(
          `/api/v1/directors/${createdDirectorId}`
        );
      }
    });

    afterEach(async () => {
      // Clean up any movies created during tests
      if (movieId) {
        await request(expressApp).delete(`/api/v1/movies/${movieId}`);
        movieId = "";
      }
    });

    it("should create a movie with the created director", async () => {
      // Create a movie with the director
      const createMovieResponse = await request(expressApp)
        .post("/api/v1/movies")
        .send({
          title: "Director Test Movie",
          description: "A test movie for director relationships",
          releaseDate: new Date("2020-01-01").toISOString(),
          genre: "Test",
          imdbId: "tt0000001",
          director: createdDirectorId,
        })
        .expect(201);

      movieId = createMovieResponse.body.data.id;

      // Verify the movie has the correct director
      expect(createMovieResponse.body.data.director).toHaveProperty(
        "id",
        createdDirectorId
      );
      expect(createMovieResponse.body.data.director).toHaveProperty(
        "firstName",
        testDirector.firstName
      );
      expect(createMovieResponse.body.data.director).toHaveProperty(
        "secondName",
        testDirector.secondName
      );
    });

    it("should not create a movie with non-existent director ID", async () => {
      const nonExistentId = "67ec2b2db4317979240fb2b7"; // Valid MongoDB ObjectID that doesn't exist

      const createMovieResponse = await request(expressApp)
        .post("/api/v1/movies")
        .send({
          title: "Invalid Director Movie",
          description: "A movie with an invalid director ID",
          releaseDate: new Date("2020-01-01").toISOString(),
          genre: "Test",
          imdbId: "tt0000002",
          director: nonExistentId,
        })
        .expect(400); // Or potentially 404, depending on implementation

      console.log(createMovieResponse.body);
    });
  });
});
