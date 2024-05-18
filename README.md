
# Natours API Documentation

BASE_URL = https://mernback-a2n5.onrender.com

## Tours

### Get All Tours
- **URL:** `{BASE_URL}/api/v1/tours`
- **Method:** `GET`
- **Description:** Retrieves all tours available.
- **Response:**
  - `200 OK` on success, returns an array of tour objects.
  - `404 Not Found` if no tours are found.

### Get Tour by ID
- **URL:** `{BASE_URL}/api/v1/tours/:id`
- **Method:** `GET`
- **Description:** Retrieves a tour by its ID.
- **Parameters:**
  - `id`: ID of the tour to retrieve.
- **Response:**
  - `200 OK` on success, returns the tour object.
  - `404 Not Found` if the tour with the specified ID is not found.

### Create Tour
- **URL:** `{BASE_URL}/api/v1/tours`
- **Method:** `POST`
- **Description:** Creates a new tour.
- **Request Body:** JSON object representing the new tour.
- **Response:**
  - `201 Created` on success, returns the created tour object.
  - `400 Bad Request` if the request body is invalid.

### Update Tour
- **URL:** `{BASE_URL}/api/v1/tours/:id`
- **Method:** `PATCH`
- **Description:** Updates an existing tour by its ID.
- **Parameters:**
  - `id`: ID of the tour to update.
- **Request Body:** JSON object with fields to update.
- **Response:**
  - `200 OK` on success, returns the updated tour object.
  - `404 Not Found` if the tour with the specified ID is not found.

### Delete Tour
- **URL:** `{BASE_URL}/api/v1/tours/:id`
- **Method:** `DELETE`
- **Description:** Deletes a tour by its ID.
- **Parameters:**
  - `id`: ID of the tour to delete.
- **Response:**
  - `204 No Content` on success, no content returned.
  - `404 Not Found` if the tour with the specified ID is not found.

## Authentication

### Register User
- **URL:** `/api/v1/user/signup`
- **Method:** `POST`
- **Description:** Registers a new user.
- **Request Body:** JSON object containing user credentials (email, password).
- **Response:**
  - `201 Created` on success, returns a JWT token for authentication.
  - `400 Bad Request` if the request body is invalid.
  - `409 Conflict` if the email is already in use.

### Login User
- **URL:** `/api/v1/user/login`
- **Method:** `POST`
- **Description:** Logs in an existing user.
- **Request Body:** JSON object containing user credentials (email, password).
- **Response:**
  - `200 OK` on success, returns a JWT token for authentication.
  - `401 Unauthorized` if the credentials are invalid.

### Logout User
- **URL:** `/api/v1/user/logout`
- **Method:** `GET`
- **Description:** Logs out the current user.
- **Response:**
  - `200 OK` on success, clears the authentication token.

### Forgot Password
- **URL:** `/api/v1/user/forgot-password`
- **Method:** `POST`
- **Description:** Sends a password reset email to the user.
- **Request Body:** JSON object containing user email.
- **Response:**
  - `200 OK` on success, sends a password reset email.
  - `404 Not Found` if the email is not found.

### Reset Password
- **URL:** `/api/v1/auth/reset-password/:resetToken`
- **Method:** `PATCH`
- **Description:** Resets the user's password using the reset token.
- **Parameters:**
  - `resetToken`: Token received in the password reset email.
- **Request Body:** JSON object containing the new password.
- **Response:**
  - `200 OK` on success, resets the password.
  - `400 Bad Request` if the reset token is invalid or expired.
 
## Users

### Get All Users
- **URL:** `/api/v1/users`
- **Method:** `GET`
- **Description:** Retrieves all users.
- **Response:**
  - `200 OK` on success, returns an array of user objects.
  - `404 Not Found` if no users are found.

### Get User by ID
- **URL:** `/api/v1/users/:id`
- **Method:** `GET`
- **Description:** Retrieves a user by their ID.
- **Parameters:**
  - `id`: ID of the user to retrieve.
- **Response:**
  - `200 OK` on success, returns the user object.
  - `404 Not Found` if the user with the specified ID is not found.

### Create User
- **URL:** `/api/v1/users`
- **Method:** `POST`
- **Description:** Creates a new user.
- **Request Body:** JSON object representing the new user.
- **Response:**
  - `201 Created` on success, returns the created user object.
  - `400 Bad Request` if the request body is invalid.

### Update User
- **URL:** `/api/v1/users/:id`
- **Method:** `PATCH`
- **Description:** Updates an existing user by their ID.
- **Parameters:**
  - `id`: ID of the user to update.
- **Request Body:** JSON object with fields to update.
- **Response:**
  - `200 OK` on success, returns the updated user object.
  - `404 Not Found` if the user with the specified ID is not found.

### Delete User
- **URL:** `/api/v1/users/:id`
- **Method:** `DELETE`
- **Description:** Deletes a user by their ID.
- **Parameters:**
  - `id`: ID of the user to delete.
- **Response:**
  - `204 No Content` on success, no content returned.
  - `404 Not Found` if the user with the specified ID is not found.
 
## Booking

### Create Booking
- **URL:** `/checkout-session/:tourId`
- **Method:** `GET`
- **Description:** Creates a new booking.
- **Request Body:** JSON object containing user ID, tour ID, and other booking details.
- **Response:**
  - `201 Created` on success, returns the created booking object.
  - `400 Bad Request` if the request body is invalid.
  - `404 Not Found` if the user or tour ID is not found.
  - `409 Conflict` if the tour is already booked for the specified dates.
  
### Get Bookings 
- **URL:** `/api/v1/bookings/my-tours`
- **Method:** `GET`
- **Description:** Retrieves all bookings made by a user.
- **Response:**
  - `200 OK` on success, returns an array of booking objects.
  - `404 Not Found` if no bookings are found for the user.

## Reviews

### Create Review
- **URL:** `/api/v1/tours/:tourId/reviews`
- **Method:** `POST`
- **Description:** Creates a new review for a tour.
- **Request Body:** JSON object containing user ID, tour ID, and review details (rating, review text).
- **Response:**
  - `201 Created` on success, returns the created review object.
  - `400 Bad Request` if the request body is invalid.
  - `404 Not Found` if the user or tour ID is not found.

### Get Reviews for Tour
- **URL:** `/api/v1/reviews/`
- **Method:** `GET`
- **Description:** Retrieves all reviews for a tour.
- **Parameters:**
  - `tourId`: ID of the tour to retrieve reviews for.
- **Response:**
  - `200 OK` on success, returns an array of review objects.
  - `404 Not Found` if no reviews are found for the tour.

### Get My Reviews
- **URL:** `/api/v1/reviews/my-reviews`
- **Method:** `GET`
- **Description:** Retrieves all reviews submitted by the authenticated user.
- **Authorization:** User must be logged in.
- **Response:**
  - `200 OK` on success, returns an array of review objects.
  - `401 Unauthorized` if user is not logged in.

### Update Review
- **URL:** `/api/v1/reviews/:id`
- **Method:** `PATCH`
- **Description:** Updates an existing review by its ID.
- **Parameters:**
  - `id`: ID of the review to update.
- **Authorization:** User must be logged in as the review owner or an admin.
- **Request Body:** JSON object with fields to update.
- **Response:**
  - `200 OK` on success, returns the updated review object.
  - `401 Unauthorized` if user is not authorized to update the review.
  - `404 Not Found` if the review with the specified ID is not found.

### Delete Review
- **URL:** `/api/v1/reviews/:id`
- **Method:** `DELETE`
- **Description:** Deletes a review by its ID.
- **Parameters:**
  - `id`: ID of the review to delete.
- **Authorization:** User must be logged in as the review owner or an admin.
- **Response:**
  - `204 No Content` on success, no content returned.
  - `401 Unauthorized` if user is not authorized to delete the review.
  - `404 Not Found` if the review with the specified ID is not found.
