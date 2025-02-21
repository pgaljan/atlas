# Atlas Project Backend Documentation

## Introduction

Atlas is a modular and interactive platform designed to visualize and annotate conceptual structures. The backend is built using NestJS , a progressive Node.js framework. The platform provides users with the ability to create, update, delete, and share structures, along with data annotation, reporting, and collaboration features.

This document covers the essential components of the backend, including setup, deployment instructions, API endpoints, and features.

## Project Setup

### Install Dependencies

To set up the project locally, clone the repository and install the necessary dependencies:

```bash
$ git clone <repository_url>
$ cd atlas-backend
$ npm install
```

### Compile and Run the Project

To run the project in different modes:

- Development mode:

```bash
$ npm run start:dev
```

- Production mode:

```bash
$ npm run start:prod
```

- Watch mode:

```bash
$ npm run start:dev
```

### Running Tests

- Unit tests:

```bash
$ npm run test
```

- End-to-end tests:

```bash
$ npm run test:e2e
```

- Test coverage:

```bash
$ npm run test:cov
```

---

## Project Features

### User Plans

The Atlas platform supports several user plans, each with a set of features suited for different use cases:

1.  Personal Plan

- Price: Free
- Storage: 100 MiB
- Structures: 5
- Key Features:
- Rich Text Annotation
- Import From Excel
- Structure Backup & Restore (Not Available)
- Export to HTML/Markdown
- Math Typesetting (Not Available)
- Email Support
- Passwordless Login

2.  Educator Plan

- Price: $1.00
- Storage: 1 GiB
- Structures: 50
- Key Features:
- Rich Text Annotation
- Import From Excel
- Structure Backup & Restore
- Export to HTML/Markdown
- Math Typesetting
- Object Tagging
- Export to DOCX, PDF, PPTX

3.  Analyst Plan

- Price: $2.00
- Storage: 10 GiB
- Structures: Unlimited
- Key Features:
- Rich Text Annotation
- Import From Excel
- Structure Backup & Restore
- Export to HTML/Markdown
- Object Tagging
- Export to DOCX, PDF, PPTX
- File Hosting

4.  Business Plan

- Price: $5.00
- Storage: 100 GiB
- Structures: Unlimited
- Key Features:
- Full Document Formatting
- AI Assistant
- Custom Templates
- Dynamic Work Breakdown Structures (WBS)
- API Access
- Export to HTML/Markdown
- Object Tagging
- Element Export
- Export to DOCX, PDF, PPTX
- Structure Linking
- Math Typesetting
- File Hosting

---

## Backup API Endpoints

The Atlas platform offers several API endpoints for managing backups. These include operations to create, retrieve, and delete backups, as well as a feature to fetch all backups for a user.

### `POST /backup/create`

Create a backup of the user’s structures and associated data.

Request:

- `userId`: Required (query param) — User ID.
- `structureId`: Optional (query param) — Structure ID to backup.

Response:

- Message indicating successful creation.
- URL to access the backup.

### `GET /backup/:id`

Retrieve a specific backup by ID.

Request:

- `id`: Required (URL param) — Backup ID.

Response:

- The details of the backup, including the public URL.

### `DELETE /backup/delete/:id`

Delete a specific backup by ID.

Request:

- `id`: Required (URL param) — Backup ID.

Response:

- Confirmation of deletion.

### `GET /backup`

Retrieve all backups associated with a user.

Request:

- `userId`: Optional (query param) — Filter backups by user ID.

Response:

- A list of backups, including file URLs and creation dates.

---

## Backup Service Overview

### Backup Creation

1.  Data Fetching : The service fetches user data, including their structures, elements, and associated records.
2.  Data Preparation : It prepares the data in sheets for Excel export.
3.  Encryption : The backup data is encrypted using AES-256-CBC for security.
4.  Zipping : The encrypted data is packaged into a ZIP file.
5.  Storing the Backup : The zip file is stored in a local backup directory, and a public URL is generated for access.

### Backup Deletion

When a backup is deleted, its associated files are removed from the server, and the backup record is deleted from the database.

### Error Handling

In case of errors, proper HTTP exceptions are thrown, such as:

- `BadRequestException`: Invalid input data.
- `NotFoundException`: Resource not found.
- `InternalServerErrorException`: Internal server error, like issues with file writing or encryption.

---

## Authentication and Authorization

- Passwordless Login : Users can log in using a passwordless mechanism, enabling a secure and simple authentication process.
- Email Support : Users on certain plans can get email support for any issues or inquiries.

---

## Additional API Endpoints

### User Management

#### `POST /user/create`

Create a new user in the system.

Request:

- `email`: Required — User's email.
- `name`: Required — User's name.

Response:

- `userId`: The ID of the newly created user.
- Confirmation message.

#### `GET /user/:id`

Retrieve a specific user by ID.

Request:

- `id`: Required (URL param) — User ID.

Response:

- User's profile information.

#### `PUT /user/:id`

Update user details.

Request:

- `id`: Required (URL param) — User ID.
- `email`: Optional — Updated email address.
- `name`: Optional — Updated name.

Response:

- Confirmation message.

#### `DELETE /user/:id`

Delete a user by ID.

Request:

- `id`: Required (URL param) — User ID.

Response:

- Confirmation message.

---

### Structure Management

#### `POST /structure/create`

Create a new structure.

Request:

- `userId`: Required (query param) — User ID.
- `structureData`: Required — The structure's data, such as name, description, and elements.

Response:

- `structureId`: The ID of the newly created structure.

#### `GET /structure/:id`

Retrieve a structure by ID.

Request:

- `id`: Required (URL param) — Structure ID.

Response:

- The structure's data.

#### `PUT /structure/:id`

Update a structure by ID.

Request:

- `id`: Required (URL param) — Structure ID.
- `structureData`: Required — The updated structure data.

Response:

- Confirmation message.

#### `DELETE /structure/:id`

Delete a structure by ID.

Request:

- `id`: Required (URL param) — Structure ID.

Response:

- Confirmation message.

---

### Element Management

#### `POST /element/create`

Create a new element within a structure.

Request:

- `structureId`: Required (query param) — Structure ID.
- `elementData`: Required — The element data.

Response:

- `elementId`: The ID of the newly created element.

#### `GET /element/:id`

Retrieve an element by ID.

Request:

- `id`: Required (URL param) — Element ID.

Response:

- The element's data.

#### `PUT /element/:id`

Update an element's data.

Request:

- `id`: Required (URL param) — Element ID.
- `elementData`: Required — Updated element data.

Response:

- Confirmation message.

#### `DELETE /element/:id`

Delete an element by ID.

Request:

- `id`: Required (URL param) — Element ID.

Response:

- Confirmation message.

---

### Record Management

#### `POST /record/create`

Create a record for a structure or element.

Request:

- `structureId`: Required (query param) — Structure ID.
- `elementId`: Required (query param) — Element ID.
- `recordData`: Required — Data for the record.

Response:

- `recordId`: The ID of the newly created record.

#### `GET /record/:id`

Retrieve a record by ID.

Request:

- `id`: Required (URL param) — Record ID.

Response:

- The record data.

---

### Restore Backup

#### `POST /restore/backup`

Restore a structure or element from a backup.

Request:

- `backupId`: Required (query param) — The backup ID.

Response:

- Confirmation message with restored structures/elements.

---

### File Upload

#### `POST /file/upload`

Upload a file to the system.

Request:

- `file`: Required (form-data) — The file to be uploaded.

Response:

- `fileUrl`: URL to access the uploaded file.

---

## Deployment

### Production Deployment

For production deployment, follow the steps to ensure optimal performance and scalability. You can deploy your application to various platforms, including cloud services like AWS, DigitalOcean, and Heroku. Refer to the official [NestJS deployment documentation](https://docs.nestjs.com/deployment) for detailed steps.

For deploying on AWS using NestJS Mau, you can use the following commands:

```bash
$ npm install -g mau
$ mau deploy
```

---

## Resources

### Documentation Links

- [NestJS Documentation](https://docs.nestjs.com)
- [NestJS Discord Channel](https://discord.gg/G7Qnnhy)
- [NestJS Courses](https://courses.nestjs.com/)
- [NestJS Mau](https://mau.nestjs.com)

### Support

For issues and support, you can visit our [NestJS community on Discord](https://discord.gg/G7Qnnhy) or check out the [NestJS Jobs board](https://jobs.nestjs.com).

---

## Stay in Touch

- Author : [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website : [NestJS](https://nestjs.com/)
- Twitter : [@nestframework](https://twitter.com/nestframework)

## License

The Atlas backend is licensed under the MIT License.
