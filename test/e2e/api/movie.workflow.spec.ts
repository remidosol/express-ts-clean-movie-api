import { Express } from "express";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../../src/main/app";
import { bootstrap } from "../../../src/main/bootstrap";

describe("Movie API E2E Tests", () => {
  let expressApp: Express;
  let createdMovieId: string;
  let directorId: string;

  // Test data
  const testMovie = {
    title: "Inception",
    description:
      "A thief who steals corporate secrets through dream-sharing technology",
    releaseDate: new Date("2010-07-16").toISOString(),
    genre: "Sci-Fi",
    rating: 8.8,
    imdbId: "tt1375666",
  };

  const updatedMovieData = {
    title: "Inception - Updated",
    description: "Updated description for Inception",
    rating: 9.0,
  };

  beforeAll(async () => {
    // Setup real app
    await bootstrap(app);
    expressApp = app;

    // Connect to test database
    await mongoose.connect(
      process.env.TEST_DATABASE_URL || "mongodb://localhost:27017/test_db"
    );

    // Create a test director first (needed for movie creation)
    const directorResponse = await request(expressApp)
      .post("/api/directors")
      .send({
        firstName: "Christopher",
        secondName: "Nolan",
        biography: "British-American film director",
        birthDate: new Date("1970-07-30").toISOString(),
      });

    directorId = directorResponse.body.data.id;
  });

  afterAll(async () => {
    // Clean up created data
    if (createdMovieId) {
      await request(expressApp).delete(`/api/movies/${createdMovieId}`);
    }

    if (directorId) {
      await request(expressApp).delete(`/api/directors/${directorId}`);
    }

    await mongoose.connection.close();
  });

  describe("POST /api/movies", () => {
    it("should create a new movie successfully", async () => {
      const response = await request(expressApp)
        .post("/api/movies")
        .send({
          ...testMovie,
          director: directorId,
        })
        .expect(201);

      expect(response.body).toHaveProperty("data");
      expect(response.body.data).toHaveProperty("id");
      expect(response.body.data.title).toBe(testMovie.title);
      expect(response.body.data.description).toBe(testMovie.description);
      expect(response.body.data.genre).toBe(testMovie.genre);
      expect(response.body.data.rating).toBe(testMovie.rating);
      expect(response.body.data.imdbId).toBe(testMovie.imdbId);
      expect(response.body.data.director).toHaveProperty("id", directorId);

      createdMovieId = response.body.data.id;
    });

    // Negative cases for movie creation
    it("should reject movie creation with missing required fields", async () => {
      const invalidMovie = {
        // Missing title, description, releaseDate, genre, imdbId
        director: directorId,
      };

      const response = await request(expressApp)
        .post("/api/movies")
        .send(invalidMovie)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should reject movie with invalid director ID", async () => {
      const movieWithInvalidDirector = {
        ...testMovie,
        director: "invalid-director-id",
      };

      await request(expressApp)
        .post("/api/movies")
        .send(movieWithInvalidDirector)
        .expect(400);
    });

    it("should reject movie with non-existent director ID", async () => {
      const nonExistentId = "507f1f77bcf86cd799439011"; // Valid MongoDB ObjectID format but doesn't exist
      const movieWithNonExistentDirector = {
        ...testMovie,
        director: nonExistentId,
      };

      await request(expressApp)
        .post("/api/movies")
        .send(movieWithNonExistentDirector)
        .expect(400);
    });

    it("should reject movie with invalid date format", async () => {
      const movieWithInvalidDate = {
        ...testMovie,
        director: directorId,
        releaseDate: "invalid-date",
      };

      await request(expressApp)
        .post("/api/movies")
        .send(movieWithInvalidDate)
        .expect(400);
    });

    it("should reject movie with invalid rating (greater than 10)", async () => {
      const movieWithInvalidRating = {
        ...testMovie,
        director: directorId,
        rating: 11, // Rating should be between 0 and 10
      };

      await request(expressApp)
        .post("/api/movies")
        .send(movieWithInvalidRating)
        .expect(400);
    });
  });

  describe("GET /api/movies", () => {
    it("should retrieve all movies with default pagination", async () => {
      const response = await request(expressApp).get("/api/movies").expect(200);

      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("pagination");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toHaveProperty("page");
      expect(response.body.pagination).toHaveProperty("limit");
      expect(response.body.pagination).toHaveProperty("total");
      expect(response.body.pagination).toHaveProperty("pages");
    });

    it("should apply pagination parameters correctly", async () => {
      const response = await request(expressApp)
        .get("/api/movies?page=1&limit=5")
        .expect(200);

      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });

    it("should filter movies by title", async () => {
      const response = await request(expressApp)
        .get(`/api/movies?title=${encodeURIComponent(testMovie.title)}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data[0].title).toBe(testMovie.title);
    });

    it("should filter movies by genre", async () => {
      const response = await request(expressApp)
        .get(`/api/movies?genre=${testMovie.genre}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data[0].genre).toBe(testMovie.genre);
    });

    it("should filter movies by director", async () => {
      const response = await request(expressApp)
        .get(`/api/movies?director=${directorId}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data[0].director.id).toBe(directorId);
    });

    it("should sort movies by specified field", async () => {
      const response = await request(expressApp)
        .get("/api/movies?sortBy=title&sortDir=asc")
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      // Verify sorting order if there are multiple movies
      if (response.body.data.length > 1) {
        expect(
          response.body.data[0].title.localeCompare(response.body.data[1].title)
        ).toBeLessThanOrEqual(0);
      }
    });

    // Negative cases for listing movies
    it("should handle invalid pagination parameters", async () => {
      // Test with negative page
      await request(expressApp).get("/api/movies?page=-1").expect(400);

      // Test with negative limit
      await request(expressApp).get("/api/movies?limit=-5").expect(400);

      // Test with non-numeric values
      await request(expressApp)
        .get("/api/movies?page=abc&limit=def")
        .expect(400);
    });

    it("should handle invalid sorting parameters", async () => {
      // Invalid sort direction
      await request(expressApp)
        .get("/api/movies?sortBy=title&sortDir=invalid")
        .expect(400);
    });
  });

  describe("GET /api/movies/:id", () => {
    it("should retrieve a movie by ID", async () => {
      const response = await request(expressApp)
        .get(`/api/movies/${createdMovieId}`)
        .expect(200);

      expect(response.body).toHaveProperty("data");
      expect(response.body.data.id).toBe(createdMovieId);
      expect(response.body.data.title).toBe(testMovie.title);
      expect(response.body.data.description).toBe(testMovie.description);
      expect(response.body.data.genre).toBe(testMovie.genre);
      expect(response.body.data.imdbId).toBe(testMovie.imdbId);
      expect(response.body.data.director).toHaveProperty("id", directorId);
    });

    // Negative cases for getting movie by ID
    it("should return 404 for non-existent movie ID", async () => {
      const nonExistentId = "507f1f77bcf86cd799439011"; // Valid MongoDB ObjectID format but doesn't exist

      await request(expressApp).get(`/api/movies/${nonExistentId}`).expect(404);
    });

    it("should return 400 for invalid movie ID format", async () => {
      await request(expressApp)
        .get("/api/movies/invalid-id-format")
        .expect(400);
    });
  });

  describe("PUT /api/movies/:id", () => {
    it("should update a movie successfully", async () => {
      const response = await request(expressApp)
        .put(`/api/movies/${createdMovieId}`)
        .send(updatedMovieData)
        .expect(200);

      expect(response.body).toHaveProperty("data");
      expect(response.body.data.id).toBe(createdMovieId);
      expect(response.body.data.title).toBe(updatedMovieData.title);
      expect(response.body.data.description).toBe(updatedMovieData.description);
      expect(response.body.data.rating).toBe(updatedMovieData.rating);

      // Unchanged fields should remain the same
      expect(response.body.data.genre).toBe(testMovie.genre);
      expect(response.body.data.imdbId).toBe(testMovie.imdbId);
      expect(response.body.data.director).toHaveProperty("id", directorId);
    });

    it("should partially update a movie", async () => {
      const partialUpdate = {
        genre: "Science Fiction",
      };

      const response = await request(expressApp)
        .put(`/api/movies/${createdMovieId}`)
        .send(partialUpdate)
        .expect(200);

      expect(response.body.data.genre).toBe(partialUpdate.genre);
      expect(response.body.data.title).toBe(updatedMovieData.title); // Previous update should be preserved
    });

    // Negative cases for updating movies
    it("should return 404 when updating non-existent movie", async () => {
      const nonExistentId = "507f1f77bcf86cd799439011";

      await request(expressApp)
        .put(`/api/movies/${nonExistentId}`)
        .send(updatedMovieData)
        .expect(404);
    });

    it("should return 400 when updating with invalid ID format", async () => {
      await request(expressApp)
        .put("/api/movies/invalid-id-format")
        .send(updatedMovieData)
        .expect(400);
    });

    it("should reject update with invalid data types", async () => {
      // Create a temporary movie for this test
      const createResponse = await request(expressApp)
        .post("/api/movies")
        .send({
          title: "Temp Movie For Invalid Update",
          description: "Will be deleted",
          releaseDate: new Date("2020-01-01").toISOString(),
          genre: "Test",
          imdbId: "tt9999999",
          director: directorId,
        })
        .expect(201);

      const tempMovieId = createResponse.body.data.id;

      // Try to update with invalid data
      await request(expressApp)
        .put(`/api/movies/${tempMovieId}`)
        .send({
          rating: "not-a-number", // Rating should be a number
        })
        .expect(400);

      // Clean up
      await request(expressApp)
        .delete(`/api/movies/${tempMovieId}`)
        .expect(204);
    });

    it("should reject update with invalid date format", async () => {
      // Create a temporary movie for this test
      const createResponse = await request(expressApp)
        .post("/api/movies")
        .send({
          title: "Temp Movie For Invalid Date",
          description: "Will be deleted",
          releaseDate: new Date("2020-01-01").toISOString(),
          genre: "Test",
          imdbId: "tt8888888",
          director: directorId,
        })
        .expect(201);

      const tempMovieId = createResponse.body.data.id;

      // Try to update with invalid date
      await request(expressApp)
        .put(`/api/movies/${tempMovieId}`)
        .send({
          releaseDate: "not-a-date",
        })
        .expect(400);

      // Clean up
      await request(expressApp)
        .delete(`/api/movies/${tempMovieId}`)
        .expect(204);
    });
  });

  describe("DELETE /api/movies/:id", () => {
    it("should delete a movie successfully", async () => {
      // Create a new movie specifically for deletion test
      const createResponse = await request(expressApp)
        .post("/api/movies")
        .send({
          title: "Movie to Delete",
          description: "This movie will be deleted",
          releaseDate: new Date("2020-01-01").toISOString(),
          genre: "Test",
          imdbId: "tt7777777",
          director: directorId,
        })
        .expect(201);

      const movieToDeleteId = createResponse.body.data.id;

      // Delete the movie
      await request(expressApp)
        .delete(`/api/movies/${movieToDeleteId}`)
        .expect(204);

      // Verify movie is actually deleted
      await request(expressApp)
        .get(`/api/movies/${movieToDeleteId}`)
        .expect(404);
    });

    // Keep the main test movie for other tests
    // We'll delete it in the final test

    // Negative cases for deleting movies
    it("should return 404 when deleting non-existent movie", async () => {
      const nonExistentId = "507f1f77bcf86cd799439011";

      await request(expressApp)
        .delete(`/api/movies/${nonExistentId}`)
        .expect(404);
    });

    it("should return 400 when deleting with invalid ID format", async () => {
      await request(expressApp)
        .delete("/api/movies/invalid-id-format")
        .expect(400);
    });
  });

  describe("Complete Movie Workflow", () => {
    it("should support the entire movie CRUD lifecycle", async () => {
      // 1. Create a new movie
      const createResponse = await request(expressApp)
        .post("/api/movies")
        .send({
          title: "The Dark Knight",
          description: "Batman fights the Joker",
          releaseDate: new Date("2008-07-18").toISOString(),
          genre: "Action",
          rating: 9.0,
          imdbId: "tt0468569",
          director: directorId,
        })
        .expect(201);

      const movieId = createResponse.body.data.id;
      expect(movieId).toBeDefined();

      // 2. Get the movie
      await request(expressApp)
        .get(`/api/movies/${movieId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.title).toBe("The Dark Knight");
        });

      // 3. Update the movie
      await request(expressApp)
        .put(`/api/movies/${movieId}`)
        .send({
          title: "The Dark Knight - Masterpiece",
          rating: 9.5,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.title).toBe("The Dark Knight - Masterpiece");
          expect(res.body.data.rating).toBe(9.5);
        });

      // 4. Verify it appears in the list
      await request(expressApp)
        .get("/api/movies")
        .expect(200)
        .expect((res) => {
          const foundMovie = res.body.data.find(
            (movie: any) => movie.id === movieId
          );
          expect(foundMovie).toBeDefined();
          expect(foundMovie.title).toBe("The Dark Knight - Masterpiece");
        });

      // 5. Delete the movie
      await request(expressApp).delete(`/api/movies/${movieId}`).expect(204);

      // 6. Verify deletion
      await request(expressApp).get(`/api/movies/${movieId}`).expect(404);

      // Finally, delete our main test movie
      if (createdMovieId) {
        await request(expressApp)
          .delete(`/api/movies/${createdMovieId}`)
          .expect(204);
        createdMovieId = "";
      }
    });
  });
});
