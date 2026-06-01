import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TaskFlow API",
      version: "1.0.0",
      description: "Scalable Task Management REST API with Role-Based Access Control",
    },
    servers: [{ url: "http://localhost:5000/api/v1" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            email: { type: "string" },
            role: { type: "string", enum: ["USER", "ADMIN"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Task: {
          type: "object",
          properties: {
            id: { type: "integer" },
            title: { type: "string" },
            description: { type: "string" },
            status: { type: "string", enum: ["PENDING", "IN_PROGRESS", "DONE"] },
            priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
            dueDate: { type: "string", format: "date-time", nullable: true },
            assignedTo: { type: "integer" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            message: { type: "string" },
            data: {
              type: "object",
              properties: {
                user: { $ref: "#/components/schemas/User" },
                token: { type: "string" },
              },
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    paths: {
      "/auth/register": {
        post: {
          tags: ["Auth"],
          security: [],
          summary: "Register a new user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password"],
                  properties: {
                    name: { type: "string" },
                    email: { type: "string" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "User registered", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } },
            409: { description: "Email already in use" },
            422: { description: "Validation error" },
          },
        },
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          security: [],
          summary: "Login",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Login successful", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } },
            401: { description: "Invalid credentials" },
          },
        },
      },
      "/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Get current user",
          responses: {
            200: { description: "Current user", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/tasks": {
        get: {
          tags: ["Tasks"],
          summary: "Get all tasks (Admin)",
          responses: {
            200: { description: "List of tasks" },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
          },
        },
        post: {
          tags: ["Tasks"],
          summary: "Create a task (Admin)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title", "assignedTo"],
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
                    dueDate: { type: "string", format: "date-time" },
                    assignedTo: { type: "integer" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Task created" },
            404: { description: "Assigned user not found" },
          },
        },
      },
      "/tasks/my": {
        get: {
          tags: ["Tasks"],
          summary: "Get my tasks (User)",
          responses: {
            200: { description: "User's tasks" },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/tasks/{id}": {
        put: {
          tags: ["Tasks"],
          summary: "Update a task (Admin)",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          requestBody: {
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Task" },
              },
            },
          },
          responses: {
            200: { description: "Task updated" },
            404: { description: "Task not found" },
          },
        },
        delete: {
          tags: ["Tasks"],
          summary: "Delete a task (Admin)",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: {
            200: { description: "Task deleted" },
            404: { description: "Task not found" },
          },
        },
      },
      "/tasks/{id}/status": {
        patch: {
          tags: ["Tasks"],
          summary: "Update task status (User)",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status"],
                  properties: {
                    status: { type: "string", enum: ["PENDING", "IN_PROGRESS", "DONE"] },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Status updated" },
            403: { description: "Not your task" },
            404: { description: "Task not found" },
          },
        },
      },
      "/users": {
        get: {
          tags: ["Users"],
          summary: "Get all users (Admin)",
          responses: {
            200: { description: "List of users" },
            403: { description: "Forbidden" },
          },
        },
      },
      "/users/{id}": {
        get: {
          tags: ["Users"],
          summary: "Get user by ID (Admin)",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
          responses: {
            200: { description: "User found" },
            404: { description: "User not found" },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;