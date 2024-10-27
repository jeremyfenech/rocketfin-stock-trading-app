# RocketFin Stock Trading Application

This is a security trading application built for the RocketFin full stack candidate programming excercise. This app features a backend built with Python Flask and a frontend built with React. This document outlines how to start the application using Docker, access the Swagger documentation, and more.

## Table of Contents
- [Setting Up](#setting-up)
- [Getting Started](#getting-started)
- [Application Structure](#application-structure)
- [Swagger Documentation](#swagger-documentation)
- [Testing](#testing)
- [Additional Information](#additional-information)

## Setting Up

As suggested in the task brief the YH Finance API is used to fetch the stock data. The API key needs to be stored in a `.env` file within the root of the backend directory (create a new file in `backend/.env`). The `.env` file should look like this for the application to work:

```
YAHOO_FINANCE_API_KEY=<YOUR_API_KEY>
```

The backend should automatically be routed to port 5000 and the frontend to 3000. If the backend is started on a different port or not on localhost the path to it needs to be adjusted within the frontend code. The path can be adjusted in the `frontend/src/config.js` file.

## Getting Started

This application is containerized with Docker. Seperate Dockerfiles are provided for the frontend and backend services, as well as a global docker-compose file to start both services simultaneously.

Assuming that the system is already equipped with Docker desktop, the application can be started by running the following command from the root directory of the project:

```
docker-compose up --build
```

This command will start both the frontend and backend services together and the application will be accessible at: http://localhost:3000/.


In the case that Docker is not installed, the services can be started seperately by runnning the following commands from the directories of the respective services:

```bash
# Start the backend service
python -m app.app

# Start the frontend service
npm start
```

## Application Structure

The application is split into two main sections:
- **Frontend**: Built with React, serves the user interface.
- **Backend**: Built with Flask, handles API requests and business logic.

## Swagger Documentation

After starting the backend service, you can access the Swagger documentation at: http://localhost:5000/apidocs/.

This documentation provides an interactive interface to explore the API endpoints and their usage.

## Testing

The application includes tests with **95%** coverage, ensuring robust functionality and reliability.

The tests can be found within the `tests` directory of the backend folder and can be run using the following command run from the backend folder:

```
pytest --cov=app tests/
```

## Additional Information

For more detailed information, please refer to the [documentation](RocketFin-FullStack-Candidate-Documentation.docx) included withinthe repo. It covers the application structure, usage, and test results in more detail.