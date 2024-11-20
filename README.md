# Computer Registration API

## Overview

The Computer Registration API is designed to manage the registration and verification of computers for students and guests using QR codes. The API supports CRUD operations for users and computers, as well as QR code generation and validation.

## Features

- Register computers for students and guests using QR codes.
- Update computer registration details.
- Verify computer registration.
- Search computers by student registration number or guest national ID.
- Generate unique QR codes.
- CRUD operations for users.
- Store and retrieve user photos.

## Dependencies

- **express**: Web framework for Node.js.
- **mongoose**: MongoDB object modeling tool.
- **dotenv**: Loads environment variables from a `.env` file.
- **zod**: TypeScript-first schema declaration and validation library.

## Dev Dependencies

- **jest**: JavaScript testing framework.
- **@jest/globals**: Provides Jest globals.
- **@types/jest**: TypeScript definitions for Jest.
- **supertest**: HTTP assertions for testing.
- **@types/supertest**: TypeScript definitions for Supertest.

## Project Structure

```
├── .env
├── .gitignore
├── .pastebin
├── config/
│   └── db.js
├── controllers/
│   ├── computerController.js
│   ├── qrCodeController.js
│   └── userController.js
├── coverage/
│   └── ...
├── index.js
├── jest.config.js
├── models/
│   ├── computer.js
│   ├── user.js
│   ├── qrcode.js
│   └── image.js
├── package.json
├── README.md
├── routes/
│   ├── computerRoutes.js
│   ├── qrCodeRoutes.js
│   └── userRoutes.js
├── tests/
│   ├── fixtures/
│   └── integration/
│       └── ...
└── utils/
    └── validation.js
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB

### Installation

1. Clone the repository:

```sh
git clone https://github.com/Bikaze/gate_entrance.git
cd gate_entrance
```

2. Install dependencies:

```sh
npm install
```

3. Create a `.env` file in the root directory and add the following environment variables:

```
MONGO_URI=your_mongodb_uri(e.g mongodb://localhost:27017/gate_entrance)
BASE_URL=http://localhost:3000
```

### Running the Application

1. Start the MongoDB server.
2. Start the application:

```sh
npm start
```

The server will run on [http://localhost:3000](http://localhost:3000).

### Running Tests

To run the tests, use the following command:

```sh
npm test
```

## API Endpoints

### User Routes

- `POST /api/users`: Create a new user.
- `GET /api/users/:id`: Get a user by ID.
- `PUT /api/users/:id`: Update a user by ID.
- `DELETE /api/users/:id`: Delete a user by ID.
- `GET /api/photos/:id`: Get user photo by ID.

### Computer Routes

- `POST /api/computers/:registrationId`: Register a computer.
- `PUT /api/computers/:registrationId`: Update computer registration.
- `GET /api/computers/verify/:registrationId`: Verify computer registration.
- `GET /api/computers/search`: Search computers by student registration number or guest national ID.

### QR Code Routes

- `POST /api/qrcodes/generate`: Generate QR codes.

## Configuration

### Database Configuration

The database connection is configured in `config/db.js`.

### Validation

Validation is handled using Zod and defined in `utils/validation.js`.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## Contact

For any questions or inquiries, please contact `your-email@example.com`.