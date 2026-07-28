<?php
$servername = "localhost";
$username = "python";
$password = "sbtph@2018";
$dbname = "sbtph_leaderboard"; // Replace with your database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$data = [
    ['year' => 2024, 'month' => 'January', 'db_name' => 'RUSTAN', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 2394],
    ['year' => 2024, 'month' => 'January', 'db_name' => 'SALLY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2470],
    ['year' => 2024, 'month' => 'January', 'db_name' => 'NEL', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2856],
    ['year' => 2024, 'month' => 'January', 'db_name' => 'RUFFY', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 7870],
    ['year' => 2024, 'month' => 'January', 'db_name' => 'XANDER', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => null],
    ['year' => 2024, 'month' => 'January', 'db_name' => 'MHEL', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2852],
    ['year' => 2024, 'month' => 'January', 'db_name' => 'RANDY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 11422],
    ['year' => 2024, 'month' => 'January', 'db_name' => 'JOMAN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2858],
    ['year' => 2024, 'month' => 'January', 'db_name' => 'CCUNANAN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 9721],
    ['year' => 2024, 'month' => 'January', 'db_name' => 'JHUN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 3002],
    ['year' => 2024, 'month' => 'January', 'db_name' => 'CHRIS', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 10359],
    ['year' => 2024, 'month' => 'January', 'db_name' => 'ARLENE', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 8059],
    ['year' => 2024, 'month' => 'January', 'db_name' => 'DAISY', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 2870],
    ['year' => 2024, 'month' => 'January', 'db_name' => 'IVANN', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 4933],
    ['year' => 2024, 'month' => 'January', 'db_name' => 'MACEDO', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 11421],
    ['year' => 2024, 'month' => 'January', 'db_name' => 'MARIE', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 6379],
    ['year' => 2024, 'month' => 'January', 'db_name' => 'BRY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2472],
    ['year' => 2024, 'month' => 'January', 'db_name' => 'PJ', 'absences_score' => 3, 'tardiness_score' => 5, 'id' => 5561],
    ['year' => 2024, 'month' => 'January', 'db_name' => 'DARWIN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 4930],
    ['year' => 2024, 'month' => 'January', 'db_name' => 'DON', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 2846],
    ['year' => 2024, 'month' => 'January', 'db_name' => 'JOHNCRIS', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => null],
    ['year' => 2024, 'month' => 'January', 'db_name' => 'VINCENT', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 9777],

    ['year' => 2024, 'month' => 'February', 'db_name' => 'RUSTAN', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 2394],
    ['year' => 2024, 'month' => 'February', 'db_name' => 'SALLY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2470],
    ['year' => 2024, 'month' => 'February', 'db_name' => 'NEL', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2856],
    ['year' => 2024, 'month' => 'February', 'db_name' => 'RUFFY', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 7870],
    ['year' => 2024, 'month' => 'February', 'db_name' => 'XANDER', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => null],
    ['year' => 2024, 'month' => 'February', 'db_name' => 'MHEL', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2852],
    ['year' => 2024, 'month' => 'February', 'db_name' => 'RANDY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 11422],
    ['year' => 2024, 'month' => 'February', 'db_name' => 'JOMAN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2858],
    ['year' => 2024, 'month' => 'February', 'db_name' => 'CCUNANAN', 'absences_score' => 5, 'tardiness_score' => 1, 'id' => 9721],
    ['year' => 2024, 'month' => 'February', 'db_name' => 'JHUN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 3002],
    ['year' => 2024, 'month' => 'February', 'db_name' => 'CHRIS', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 10359],
    ['year' => 2024, 'month' => 'February', 'db_name' => 'ARLENE', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 8059],
    ['year' => 2024, 'month' => 'February', 'db_name' => 'DAISY', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 2870],
    ['year' => 2024, 'month' => 'February', 'db_name' => 'IVANN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 4933],
    ['year' => 2024, 'month' => 'February', 'db_name' => 'MACEDO', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 11421],
    ['year' => 2024, 'month' => 'February', 'db_name' => 'MARIE', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 6379],
    ['year' => 2024, 'month' => 'February', 'db_name' => 'BRY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2472],
    ['year' => 2024, 'month' => 'February', 'db_name' => 'PJ', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 5561],
    ['year' => 2024, 'month' => 'February', 'db_name' => 'DARWIN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 4930],
    ['year' => 2024, 'month' => 'February', 'db_name' => 'DON', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2846],
    ['year' => 2024, 'month' => 'February', 'db_name' => 'JOHNCRIS', 'absences_score' => 1, 'tardiness_score' => 0, 'id' => null],
    ['year' => 2024, 'month' => 'February', 'db_name' => 'VINCENT', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 9777],

    ['year' => 2024, 'month' => 'March', 'db_name' => 'RUFFY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 7870],
    ['year' => 2024, 'month' => 'March', 'db_name' => 'XANDER', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 2858],
    ['year' => 2024, 'month' => 'March', 'db_name' => 'MHEL', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2852],
    ['year' => 2024, 'month' => 'March', 'db_name' => 'RANDY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 11422],
    ['year' => 2024, 'month' => 'March', 'db_name' => 'JOMAN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2858],
    ['year' => 2024, 'month' => 'March', 'db_name' => 'CCUNANAN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 9721],
    ['year' => 2024, 'month' => 'March', 'db_name' => 'JHUN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 3002],
    ['year' => 2024, 'month' => 'March', 'db_name' => 'CHRIS', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 10359],
    ['year' => 2024, 'month' => 'March', 'db_name' => 'ARLENE', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 8059],
    ['year' => 2024, 'month' => 'March', 'db_name' => 'DAISY', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 2870],
    ['year' => 2024, 'month' => 'March', 'db_name' => 'IVANN', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 4933],
    ['year' => 2024, 'month' => 'March', 'db_name' => 'MACEDO', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 11421],
    ['year' => 2024, 'month' => 'March', 'db_name' => 'MARIE', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 6379],
    ['year' => 2024, 'month' => 'March', 'db_name' => 'BRY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2472],
    ['year' => 2024, 'month' => 'March', 'db_name' => 'PJ', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 5561],
    ['year' => 2024, 'month' => 'March', 'db_name' => 'DARWIN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 4930],
    ['year' => 2024, 'month' => 'March', 'db_name' => 'DON', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2846],
    ['year' => 2024, 'month' => 'March', 'db_name' => 'JOHNCRIS', 'absences_score' => 1, 'tardiness_score' => 0, 'id' => null],
    ['year' => 2024, 'month' => 'March', 'db_name' => 'VINCENT', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 9777],


    ['year' => 2024, 'month' => 'April', 'db_name' => 'RUSTAN', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 2394],
    ['year' => 2024, 'month' => 'April', 'db_name' => 'SALLY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2470],
    ['year' => 2024, 'month' => 'April', 'db_name' => 'NEL', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2856],
    ['year' => 2024, 'month' => 'April', 'db_name' => 'RUFFY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 7870],
    ['year' => 2024, 'month' => 'April', 'db_name' => 'MHEL', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2852],
    ['year' => 2024, 'month' => 'April', 'db_name' => 'RANDY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 11422],
    ['year' => 2024, 'month' => 'April', 'db_name' => 'JOMAN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2858],
    ['year' => 2024, 'month' => 'April', 'db_name' => 'CCUNANAN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 9721],
    ['year' => 2024, 'month' => 'April', 'db_name' => 'JHUN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 3002],
    ['year' => 2024, 'month' => 'April', 'db_name' => 'CHRIS', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 10359],
    ['year' => 2024, 'month' => 'April', 'db_name' => 'ARLENE', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 8059],
    ['year' => 2024, 'month' => 'April', 'db_name' => 'DAISY', 'absences_score' => 5, 'tardiness_score' => 1, 'id' => 2870],
    ['year' => 2024, 'month' => 'April', 'db_name' => 'IVANN', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 4933],
    ['year' => 2024, 'month' => 'April', 'db_name' => 'MACEDO', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 11421],
    ['year' => 2024, 'month' => 'April', 'db_name' => 'MARIE', 'absences_score' => 5, 'tardiness_score' => 0, 'id' => 6379],
    ['year' => 2024, 'month' => 'April', 'db_name' => 'BRY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2472],
    ['year' => 2024, 'month' => 'April', 'db_name' => 'PJ', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 5561],
    ['year' => 2024, 'month' => 'April', 'db_name' => 'DARWIN', 'absences_score' => 5, 'tardiness_score' => 0, 'id' => 4930],
    ['year' => 2024, 'month' => 'April', 'db_name' => 'DON', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2846],
    ['year' => 2024, 'month' => 'April', 'db_name' => 'VINCENT', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 9777],

    ['year' => 2024, 'month' => 'May', 'db_name' => 'RUSTAN', 'absences_score' => 5, 'tardiness_score' => 0, 'id' => 2394],
    ['year' => 2024, 'month' => 'May', 'db_name' => 'SALLY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2470],
    ['year' => 2024, 'month' => 'May', 'db_name' => 'NEL', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2856],
    ['year' => 2024, 'month' => 'May', 'db_name' => 'RUFFY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 7870],
    ['year' => 2024, 'month' => 'May', 'db_name' => 'MHEL', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 2852],
    ['year' => 2024, 'month' => 'May', 'db_name' => 'RANDY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 11422],
    ['year' => 2024, 'month' => 'May', 'db_name' => 'JOMAN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2858],
    ['year' => 2024, 'month' => 'May', 'db_name' => 'CCUNANAN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 9721],
    ['year' => 2024, 'month' => 'May', 'db_name' => 'JHUN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 3002],
    ['year' => 2024, 'month' => 'May', 'db_name' => 'CHRIS', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 10359],
    ['year' => 2024, 'month' => 'May', 'db_name' => 'ARLENE', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 8059],
    ['year' => 2024, 'month' => 'May', 'db_name' => 'DAISY', 'absences_score' => 5, 'tardiness_score' => 1, 'id' => 2870],
    ['year' => 2024, 'month' => 'May', 'db_name' => 'IVANN', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 4933],
    ['year' => 2024, 'month' => 'May', 'db_name' => 'MACEDO', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 11421],
    ['year' => 2024, 'month' => 'May', 'db_name' => 'MARIE', 'absences_score' => 5, 'tardiness_score' => 0, 'id' => 6379],
    ['year' => 2024, 'month' => 'May', 'db_name' => 'BRY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2472],
    ['year' => 2024, 'month' => 'May', 'db_name' => 'PJ', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 5561],
    ['year' => 2024, 'month' => 'May', 'db_name' => 'DARWIN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 4930],
    ['year' => 2024, 'month' => 'May', 'db_name' => 'DON', 'absences_score' => 1, 'tardiness_score' => 5, 'id' => 2846],
    ['year' => 2024, 'month' => 'May', 'db_name' => 'VINCENT', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 9777],

    // June Data
    ['year' => 2024, 'month' => 'June', 'db_name' => 'RUSTAN', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 2394],
    ['year' => 2024, 'month' => 'June', 'db_name' => 'SALLY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2470],
    ['year' => 2024, 'month' => 'June', 'db_name' => 'NEL', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2856],
    ['year' => 2024, 'month' => 'June', 'db_name' => 'RUFFY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 7870],
    ['year' => 2024, 'month' => 'June', 'db_name' => 'MHEL', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2852],
    ['year' => 2024, 'month' => 'June', 'db_name' => 'RANDY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 11422],
    ['year' => 2024, 'month' => 'June', 'db_name' => 'JOMAN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2858],
    ['year' => 2024, 'month' => 'June', 'db_name' => 'CCUNANAN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 9721],
    ['year' => 2024, 'month' => 'June', 'db_name' => 'JHUN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 3002],
    ['year' => 2024, 'month' => 'June', 'db_name' => 'CHRIS', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 10359],
    ['year' => 2024, 'month' => 'June', 'db_name' => 'ARLENE', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 8059],
    ['year' => 2024, 'month' => 'June', 'db_name' => 'DAISY', 'absences_score' => 5, 'tardiness_score' => 0, 'id' => 2870],
    ['year' => 2024, 'month' => 'June', 'db_name' => 'IVANN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 4933],
    ['year' => 2024, 'month' => 'June', 'db_name' => 'MACEDO', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 11421],
    ['year' => 2024, 'month' => 'June', 'db_name' => 'MARIE', 'absences_score' => 5, 'tardiness_score' => 1, 'id' => 6379],
    ['year' => 2024, 'month' => 'June', 'db_name' => 'BRY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2472],
    ['year' => 2024, 'month' => 'June', 'db_name' => 'PJ', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 5561],
    ['year' => 2024, 'month' => 'June', 'db_name' => 'DARWIN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 4930],
    ['year' => 2024, 'month' => 'June', 'db_name' => 'DON', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2846],
    ['year' => 2024, 'month' => 'June', 'db_name' => 'VINCENT', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 9777],

    ['year' => 2024, 'month' => 'July', 'db_name' => 'RUSTAN', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 2394],
    ['year' => 2024, 'month' => 'July', 'db_name' => 'SALLY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2470],
    ['year' => 2024, 'month' => 'July', 'db_name' => 'NEL', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 2856],
    ['year' => 2024, 'month' => 'July', 'db_name' => 'RUFFY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 7870],
    ['year' => 2024, 'month' => 'July', 'db_name' => 'MHEL', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2852],
    ['year' => 2024, 'month' => 'July', 'db_name' => 'RANDY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 11422],
    ['year' => 2024, 'month' => 'July', 'db_name' => 'JOMAN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2858],
    ['year' => 2024, 'month' => 'July', 'db_name' => 'CCUNANAN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 9721],
    ['year' => 2024, 'month' => 'July', 'db_name' => 'JHUN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 3002],
    ['year' => 2024, 'month' => 'July', 'db_name' => 'CHRIS', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 10359],
    ['year' => 2024, 'month' => 'July', 'db_name' => 'ARLENE', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 8059],
    ['year' => 2024, 'month' => 'July', 'db_name' => 'DAISY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2870],
    ['year' => 2024, 'month' => 'July', 'db_name' => 'IVANN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 4933],
    ['year' => 2024, 'month' => 'July', 'db_name' => 'MACEDO', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 11421],
    ['year' => 2024, 'month' => 'July', 'db_name' => 'MARIE', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 6379],
    ['year' => 2024, 'month' => 'July', 'db_name' => 'BRY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2472],
    ['year' => 2024, 'month' => 'July', 'db_name' => 'PJ', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 5561],
    ['year' => 2024, 'month' => 'July', 'db_name' => 'DARWIN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 4930],
    ['year' => 2024, 'month' => 'July', 'db_name' => 'DON', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2846],
    ['year' => 2024, 'month' => 'July', 'db_name' => 'VINCENT', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 9777],
    ['year' => 2024, 'month' => 'August', 'db_name' => 'RUSTAN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2394],
    ['year' => 2024, 'month' => 'August', 'db_name' => 'SALLY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2470],
    ['year' => 2024, 'month' => 'August', 'db_name' => 'NEL', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2856],
    ['year' => 2024, 'month' => 'August', 'db_name' => 'RUFFY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 7870],
    ['year' => 2024, 'month' => 'August', 'db_name' => 'MHEL', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2852],
    ['year' => 2024, 'month' => 'August', 'db_name' => 'RANDY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 11422],
    ['year' => 2024, 'month' => 'August', 'db_name' => 'JOMAN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2858],
    ['year' => 2024, 'month' => 'August', 'db_name' => 'CCUNANAN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 9721],
    ['year' => 2024, 'month' => 'August', 'db_name' => 'JHUN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 3002],
    ['year' => 2024, 'month' => 'August', 'db_name' => 'CHRIS', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 10359],
    ['year' => 2024, 'month' => 'August', 'db_name' => 'ARLENE', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 8059],
    ['year' => 2024, 'month' => 'August', 'db_name' => 'DAISY', 'absences_score' => 5, 'tardiness_score' => 1, 'id' => 2870],
    ['year' => 2024, 'month' => 'August', 'db_name' => 'IVANN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 4933],
    ['year' => 2024, 'month' => 'August', 'db_name' => 'MACEDO', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 11421],
    ['year' => 2024, 'month' => 'August', 'db_name' => 'MARIE', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 6379],
    ['year' => 2024, 'month' => 'August', 'db_name' => 'BRY', 'absences_score' => 3, 'tardiness_score' => 5, 'id' => 2472],
    ['year' => 2024, 'month' => 'August', 'db_name' => 'PJ', 'absences_score' => 3, 'tardiness_score' => 5, 'id' => 5561],
    ['year' => 2024, 'month' => 'August', 'db_name' => 'DARWIN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 4930],
    ['year' => 2024, 'month' => 'August', 'db_name' => 'DON', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2846],
    ['year' => 2024, 'month' => 'August', 'db_name' => 'VINCENT', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 9777],

    ['year' => 2024, 'month' => 'September', 'db_name' => 'RUSTAN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2394],
    ['year' => 2024, 'month' => 'September', 'db_name' => 'SALLY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2470],
    ['year' => 2024, 'month' => 'September', 'db_name' => 'NEL', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2856],
    ['year' => 2024, 'month' => 'September', 'db_name' => 'RUFFY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 7870],
    ['year' => 2024, 'month' => 'September', 'db_name' => 'MHEL', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2852],
    ['year' => 2024, 'month' => 'September', 'db_name' => 'RANDY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 11422],
    ['year' => 2024, 'month' => 'September', 'db_name' => 'JOMAN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2858],
    ['year' => 2024, 'month' => 'September', 'db_name' => 'CCUNANAN', 'absences_score' => 5, 'tardiness_score' => 0, 'id' => 9721],
    ['year' => 2024, 'month' => 'September', 'db_name' => 'JHUN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 3002],
    ['year' => 2024, 'month' => 'September', 'db_name' => 'CHRIS', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 10359],
    ['year' => 2024, 'month' => 'September', 'db_name' => 'ARLENE', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 8059],
    ['year' => 2024, 'month' => 'September', 'db_name' => 'DAISY', 'absences_score' => 3, 'tardiness_score' => 1, 'id' => 2870],
    ['year' => 2024, 'month' => 'September', 'db_name' => 'IVANN', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 4933],
    ['year' => 2024, 'month' => 'September', 'db_name' => 'MACEDO', 'absences_score' => 5, 'tardiness_score' => 1, 'id' => 11421],
    ['year' => 2024, 'month' => 'September', 'db_name' => 'MARIE', 'absences_score' => 3, 'tardiness_score' => 3, 'id' => 6379],
    ['year' => 2024, 'month' => 'September', 'db_name' => 'BRY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2472],
    ['year' => 2024, 'month' => 'September', 'db_name' => 'PJ', 'absences_score' => 1, 'tardiness_score' => 1, 'id' => 5561],
    ['year' => 2024, 'month' => 'September', 'db_name' => 'DARWIN', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 4930],
    ['year' => 2024, 'month' => 'September', 'db_name' => 'DON', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2846],
    ['year' => 2024, 'month' => 'September', 'db_name' => 'VINCENT', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 9777],
    ['year' => 2024, 'month' => 'October', 'db_name' => 'RUSTAN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2394],
    ['year' => 2024, 'month' => 'October', 'db_name' => 'SALLY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2470],
    ['year' => 2024, 'month' => 'October', 'db_name' => 'NEL', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2856],
    ['year' => 2024, 'month' => 'October', 'db_name' => 'RUFFY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 7870],
    ['year' => 2024, 'month' => 'October', 'db_name' => 'MHEL', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2852],
    ['year' => 2024, 'month' => 'October', 'db_name' => 'RANDY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 11422],
    ['year' => 2024, 'month' => 'October', 'db_name' => 'JOMAN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2858],
    ['year' => 2024, 'month' => 'October', 'db_name' => 'CCUNANAN', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 9721],
    ['year' => 2024, 'month' => 'October', 'db_name' => 'JHUN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 3002],
    ['year' => 2024, 'month' => 'October', 'db_name' => 'CHRIS', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 10359],
    ['year' => 2024, 'month' => 'October', 'db_name' => 'ARLENE', 'absences_score' => 5, 'tardiness_score' => 1, 'id' => 8059],
    ['year' => 2024, 'month' => 'October', 'db_name' => 'DAISY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2870],
    ['year' => 2024, 'month' => 'October', 'db_name' => 'IVANN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 4933],
    ['year' => 2024, 'month' => 'October', 'db_name' => 'MACEDO', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 11421],
    ['year' => 2024, 'month' => 'October', 'db_name' => 'MARIE', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 6379],
    ['year' => 2024, 'month' => 'October', 'db_name' => 'BRY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2472],
    ['year' => 2024, 'month' => 'October', 'db_name' => 'PJ', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 5561],
    ['year' => 2024, 'month' => 'October', 'db_name' => 'DARWIN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 4930],
    ['year' => 2024, 'month' => 'October', 'db_name' => 'DON', 'absences_score' => 3, 'tardiness_score' => 5, 'id' => 2846],
    ['year' => 2024, 'month' => 'October', 'db_name' => 'VINCENT', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 9777],

];


// $data = [
    
//     ['month' => 'January', 'year' => 2023, 'db_name' => 'SALLY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2470],
//     ['month' => 'January', 'year' => 2023, 'db_name' => 'NEL', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2856],
//     ['month' => 'January', 'year' => 2023, 'db_name' => 'RUFFY', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 7870],
//     ['month' => 'January', 'year' => 2023, 'db_name' => 'MHEL', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2852],
//     ['month' => 'January', 'year' => 2023, 'db_name' => 'RANDY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 11422],
//     ['month' => 'January', 'year' => 2023, 'db_name' => 'JOMAN', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 2858],
//     ['month' => 'January', 'year' => 2023, 'db_name' => 'JHUN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 3002],
//     ['month' => 'January', 'year' => 2023, 'db_name' => 'CHRIS', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 10359],
//     ['month' => 'January', 'year' => 2023, 'db_name' => 'CCUNANAN', 'absences_score' => 5, 'tardiness_score' => 1, 'id' => 9721],
//     ['month' => 'January', 'year' => 2023, 'db_name' => 'ARLENE', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 8059],
//     ['month' => 'January', 'year' => 2023, 'db_name' => 'IVANN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 4933],
//     ['month' => 'January', 'year' => 2023, 'db_name' => 'MACEDO', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 11421],
//     ['month' => 'January', 'year' => 2023, 'db_name' => 'BRY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2472],
//     ['month' => 'January', 'year' => 2023, 'db_name' => 'PJ', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 5561],
//     ['month' => 'January', 'year' => 2023, 'db_name' => 'DARWIN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 4930],
//     ['month' => 'January', 'year' => 2023, 'db_name' => 'DON', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2846],
//     ['month' => 'January', 'year' => 2023, 'db_name' => 'VINCENT', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 9777],

//     ['year' => 2023, 'month' => 'February', 'db_name' => 'RUSTAN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2394],
//     ['year' => 2023, 'month' => 'February', 'db_name' => 'SALLY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2470],
//     ['year' => 2023, 'month' => 'February', 'db_name' => 'NEL', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2856],
//     ['year' => 2023, 'month' => 'February', 'db_name' => 'RUFFY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 7870],
//     ['year' => 2023, 'month' => 'February', 'db_name' => 'MHEL', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2852],
//     ['year' => 2023, 'month' => 'February', 'db_name' => 'RANDY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 11422],
//     ['year' => 2023, 'month' => 'February', 'db_name' => 'JOMAN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2858],
//     ['year' => 2023, 'month' => 'February', 'db_name' => 'JHUN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 3002],
//     ['year' => 2023, 'month' => 'February', 'db_name' => 'CHRIS', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 10359],
//     // ['year' => 2023, 'month' => 'February', 'db_name' => 'KATHY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => null],
//     ['year' => 2023, 'month' => 'February', 'db_name' => 'CCUNANAN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 9721],
//     ['year' => 2023, 'month' => 'February', 'db_name' => 'ARLENE', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 8059],
//     // ['year' => 2023, 'month' => 'February', 'db_name' => 'EZEKIEL', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => null],
//     // ['year' => 2023, 'month' => 'February', 'db_name' => 'XANDER', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => null],
//     ['year' => 2023, 'month' => 'February', 'db_name' => 'IVANN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 4933],
//     ['year' => 2023, 'month' => 'February', 'db_name' => 'MACEDO', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 11421],
//     ['year' => 2023, 'month' => 'February', 'db_name' => 'BRY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2472],
//     ['year' => 2023, 'month' => 'February', 'db_name' => 'PJ', 'absences_score' => 3.00, 'tardiness_score' => 5.00, 'id' => 5561],
//     ['year' => 2023, 'month' => 'February', 'db_name' => 'DARWIN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 4930],
//     ['year' => 2023, 'month' => 'February', 'db_name' => 'DON', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2846],
//     ['year' => 2023, 'month' => 'February', 'db_name' => 'VINCENT', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 9777],


//     ['year' => 2023, 'month' => 'March', 'db_name' => 'RUSTAN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2394],
//     ['year' => 2023, 'month' => 'March', 'db_name' => 'SALLY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2470],
//     ['year' => 2023, 'month' => 'March', 'db_name' => 'NEL', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2856],
//     ['year' => 2023, 'month' => 'March', 'db_name' => 'RUFFY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 7870],
//     ['year' => 2023, 'month' => 'March', 'db_name' => 'MHEL', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2852],
//     ['year' => 2023, 'month' => 'March', 'db_name' => 'RANDY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 11422],
//     ['year' => 2023, 'month' => 'March', 'db_name' => 'JOMAN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2858],
//     ['year' => 2023, 'month' => 'March', 'db_name' => 'CCUNANAN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 9721],
//     ['year' => 2023, 'month' => 'March', 'db_name' => 'JHUN', 'absences_score' => 5.00, 'tardiness_score' => 3.00, 'id' => 3002],
//     ['year' => 2023, 'month' => 'March', 'db_name' => 'CHRIS', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 10359],
//     // ['year' => 2023, 'month' => 'March', 'db_name' => 'KATHY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => null],
//     ['year' => 2023, 'month' => 'March', 'db_name' => 'ARLENE', 'absences_score' => 5.00, 'tardiness_score' => 3.00, 'id' => 8059],
//     // ['year' => 2023, 'month' => 'March', 'db_name' => 'EZEKIEL', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => null],
//     // ['year' => 2023, 'month' => 'March', 'db_name' => 'XANDER', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => null],
//     ['year' => 2023, 'month' => 'March', 'db_name' => 'IVANN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 4933],
//     ['year' => 2023, 'month' => 'March', 'db_name' => 'MACEDO', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 11421],
//     ['year' => 2023, 'month' => 'March', 'db_name' => 'BRY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2472],
//     ['year' => 2023, 'month' => 'March', 'db_name' => 'PJ', 'absences_score' => 5.00, 'tardiness_score' => 3.00, 'id' => 5561],
//     // ['year' => 2023, 'month' => 'March', 'db_name' => 'KEN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => null],
//     ['year' => 2023, 'month' => 'March', 'db_name' => 'DARWIN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 4930],
//     ['year' => 2023, 'month' => 'March', 'db_name' => 'DON', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2846],
//     // ['year' => 2023, 'month' => 'March', 'db_name' => 'JOHNCRIS', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => null],
//     ['year' => 2023, 'month' => 'March', 'db_name' => 'VINCENT', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 9777],
//     // ['year' => 2023, 'month' => 'March', 'db_name' => 'ROMANO', 'absences_score' => 5.00, 'tardiness_score' => 1.00, 'id' => null],

//     ['year' => 2023, 'month' => 'April', 'db_name' => 'RUSTAN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2394],
//     ['year' => 2023, 'month' => 'April', 'db_name' => 'SALLY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2470],
//     ['year' => 2023, 'month' => 'April', 'db_name' => 'NEL', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2856],
//     ['year' => 2023, 'month' => 'April', 'db_name' => 'RUFFY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 7870],
//     ['year' => 2023, 'month' => 'April', 'db_name' => 'XANDER', 'absences_score' => 5.00, 'tardiness_score' => 3.00, 'id' => null], // No ID available
//     ['year' => 2023, 'month' => 'April', 'db_name' => 'MHEL', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2852],
//     ['year' => 2023, 'month' => 'April', 'db_name' => 'RANDY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 11422],
//     ['year' => 2023, 'month' => 'April', 'db_name' => 'JOMAN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2858],
//     ['year' => 2023, 'month' => 'April', 'db_name' => 'CCUNANAN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 9721],
//     ['year' => 2023, 'month' => 'April', 'db_name' => 'JHUN', 'absences_score' => 5.00, 'tardiness_score' => 3.00, 'id' => 3002],
//     ['year' => 2023, 'month' => 'April', 'db_name' => 'CHRIS', 'absences_score' => 5.00, 'tardiness_score' => 3.00, 'id' => 10359],
//     ['year' => 2023, 'month' => 'April', 'db_name' => 'KATHY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => null], // No ID available
//     ['year' => 2023, 'month' => 'April', 'db_name' => 'ARLENE', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 8059],
//     ['year' => 2023, 'month' => 'April', 'db_name' => 'EZEKIEL', 'absences_score' => 5.00, 'tardiness_score' => 3.00, 'id' => null], // No ID available
//     ['year' => 2023, 'month' => 'April', 'db_name' => 'IVANN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 4933],
//     ['year' => 2023, 'month' => 'April', 'db_name' => 'MACEDO', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 11421],
//     ['year' => 2023, 'month' => 'April', 'db_name' => 'MARIE', 'absences_score' => 5.00, 'tardiness_score' => 1.00, 'id' => 6379],
//     ['year' => 2023, 'month' => 'April', 'db_name' => 'BRY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2472],
//     ['year' => 2023, 'month' => 'April', 'db_name' => 'PJ', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 5561],
//     ['year' => 2023, 'month' => 'April', 'db_name' => 'KEN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => null], // No ID available
//     ['year' => 2023, 'month' => 'April', 'db_name' => 'DARWIN', 'absences_score' => 5.00, 'tardiness_score' => 3.00, 'id' => 4930],
//     ['year' => 2023, 'month' => 'April', 'db_name' => 'ROMANO', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => null], // No ID available
//     ['year' => 2023, 'month' => 'April', 'db_name' => 'DON', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2846],
//     ['year' => 2023, 'month' => 'April', 'db_name' => 'JOHNCRIS', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => null], // No ID available
//     ['year' => 2023, 'month' => 'April', 'db_name' => 'VINCENT', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 9777], 

//     // Data for May
//     ['year' => 2023, 'month' => 'May', 'db_name' => 'RUSTAN', 'absences_score' => 5.00, 'tardiness_score' => 1.00, 'id' => 2394],
//     ['year' => 2023, 'month' => 'May', 'db_name' => 'SALLY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2470],
//     ['year' => 2023, 'month' => 'May', 'db_name' => 'NEL', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2856],
//     ['year' => 2023, 'month' => 'May', 'db_name' => 'RUFFY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 7870],
//     ['year' => 2023, 'month' => 'May', 'db_name' => 'XANDER', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => null], // No ID available
//     ['year' => 2023, 'month' => 'May', 'db_name' => 'MHEL', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2852],
//     ['year' => 2023, 'month' => 'May', 'db_name' => 'RANDY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 11422],
//     ['year' => 2023, 'month' => 'May', 'db_name' => 'JOMAN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2858],
//     ['year' => 2023, 'month' => 'May', 'db_name' => 'CCUNANAN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 9721],
//     ['year' => 2023, 'month' => 'May', 'db_name' => 'JHUN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 3002],
//     ['year' => 2023, 'month' => 'May', 'db_name' => 'CHRIS', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 10359],
//     ['year' => 2023, 'month' => 'May', 'db_name' => 'KATHY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => null], // No ID available
//     ['year' => 2023, 'month' => 'May', 'db_name' => 'ARLENE', 'absences_score' => 5.00, 'tardiness_score' => 3.00, 'id' => 8059],
//     ['year' => 2023, 'month' => 'May', 'db_name' => 'EZEKIEL', 'absences_score' => 5.00, 'tardiness_score' => 0, 'id' => null], // No tardiness score
//     ['year' => 2023, 'month' => 'May', 'db_name' => 'IVANN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 4933],
//     ['year' => 2023, 'month' => 'May', 'db_name' => 'MACEDO', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 11421],
//     ['year' => 2023, 'month' => 'May', 'db_name' => 'MARIE', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 6379],
//     ['year' => 2023, 'month' => 'May', 'db_name' => 'BRY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2472],
//     ['year' => 2023, 'month' => 'May', 'db_name' => 'PJ', 'absences_score' => 3.00, 'tardiness_score' => 5.00, 'id' => 5561],
//     ['year' => 2023, 'month' => 'May', 'db_name' => 'KEN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => null], // No ID available
//     ['year' => 2023, 'month' => 'May', 'db_name' => 'DARWIN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 4930],
//     ['year' => 2023, 'month' => 'May', 'db_name' => 'ROMANO', 'absences_score' => 5.00, 'tardiness_score' => 3.00, 'id' => null], // No ID available
//     ['year' => 2023, 'month' => 'May', 'db_name' => 'DON', 'absences_score' => 5.00, 'tardiness_score' => 3.00, 'id' => 2846],
//     ['year' => 2023, 'month' => 'May', 'db_name' => 'JOHNCRIS', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => null], // No ID available
//     ['year' => 2023, 'month' => 'May', 'db_name' => 'VINCENT', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 9777],

//     ['year' => 2023, 'month' => 'June', 'db_name' => 'RUSTAN', 'absences_score' => 5.00, 'tardiness_score' => 3.00, 'id' => 2394],
//     ['year' => 2023, 'month' => 'June', 'db_name' => 'SALLY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2470],
//     ['year' => 2023, 'month' => 'June', 'db_name' => 'NEL', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2856],
//     ['year' => 2023, 'month' => 'June', 'db_name' => 'RUFFY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 7870],
//     ['year' => 2023, 'month' => 'June', 'db_name' => 'XANDER', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => null],
//     ['year' => 2023, 'month' => 'June', 'db_name' => 'MHEL', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2852],
//     ['year' => 2023, 'month' => 'June', 'db_name' => 'RANDY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 11422],
//     ['year' => 2023, 'month' => 'June', 'db_name' => 'JOMAN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2858],
//     ['year' => 2023, 'month' => 'June', 'db_name' => 'CCUNANAN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 9721],
//     ['year' => 2023, 'month' => 'June', 'db_name' => 'JHUN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 3002],
//     ['year' => 2023, 'month' => 'June', 'db_name' => 'CHRIS', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 10359],
//     ['year' => 2023, 'month' => 'June', 'db_name' => 'KATHY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => null],
//     ['year' => 2023, 'month' => 'June', 'db_name' => 'ARLENE', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 8059],
//     ['year' => 2023, 'month' => 'June', 'db_name' => 'EZEKIEL', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => null],
//     ['year' => 2023, 'month' => 'June', 'db_name' => 'IVANN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 4933],
//     ['year' => 2023, 'month' => 'June', 'db_name' => 'MACEDO', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 11421],
//     ['year' => 2023, 'month' => 'June', 'db_name' => 'MARIE', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 6379],
//     ['year' => 2023, 'month' => 'June', 'db_name' => 'BRY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2472],
//     ['year' => 2023, 'month' => 'June', 'db_name' => 'PJ', 'absences_score' => 3.00, 'tardiness_score' => 0, 'id' => 5561],
//     ['year' => 2023, 'month' => 'June', 'db_name' => 'KEN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => null],
//     ['year' => 2023, 'month' => 'June', 'db_name' => 'DARWIN', 'absences_score' => 5.00, 'tardiness_score' => 0, 'id' => 4930],
//     ['year' => 2023, 'month' => 'June', 'db_name' => 'ROMANO', 'absences_score' => 3.00, 'tardiness_score' => 0, 'id' => null],
//     ['year' => 2023, 'month' => 'June', 'db_name' => 'DON', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2846],
//     ['year' => 2023, 'month' => 'June', 'db_name' => 'JOHNCRIS', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => null],
//     ['year' => 2023, 'month' => 'June', 'db_name' => 'VINCENT', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 9777],

//     ['year' => 2023, 'month' => 'July', 'db_name' => 'RUSTAN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2394],
//     ['year' => 2023, 'month' => 'July', 'db_name' => 'SALLY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2470],
//     ['year' => 2023, 'month' => 'July', 'db_name' => 'NEL', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2856],
//     ['year' => 2023, 'month' => 'July', 'db_name' => 'RUFFY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 7870],
//     ['year' => 2023, 'month' => 'July', 'db_name' => 'XANDER', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => null],
//     ['year' => 2023, 'month' => 'July', 'db_name' => 'MHEL', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2852],
//     ['year' => 2023, 'month' => 'July', 'db_name' => 'RANDY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 11422],
//     ['year' => 2023, 'month' => 'July', 'db_name' => 'JOMAN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2858],
//     ['year' => 2023, 'month' => 'July', 'db_name' => 'CCUNANAN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 9721],
//     ['year' => 2023, 'month' => 'July', 'db_name' => 'JHUN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 3002],
//     ['year' => 2023, 'month' => 'July', 'db_name' => 'CHRIS', 'absences_score' => 5.00, 'tardiness_score' => 3.00, 'id' => 10359],
//     ['year' => 2023, 'month' => 'July', 'db_name' => 'ARLENE', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 8059],
//     ['year' => 2023, 'month' => 'July', 'db_name' => 'IVANN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 4933],
//     ['year' => 2023, 'month' => 'July', 'db_name' => 'MACEDO', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 11421],
//     ['year' => 2023, 'month' => 'July', 'db_name' => 'MARIE', 'absences_score' => 5.00, 'tardiness_score' => 3.00, 'id' => 6379],
//     ['year' => 2023, 'month' => 'July', 'db_name' => 'BRY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2472],
//     ['year' => 2023, 'month' => 'July', 'db_name' => 'PJ', 'absences_score' => 3.00, 'tardiness_score' => 5.00, 'id' => 5561],
//     ['year' => 2023, 'month' => 'July', 'db_name' => 'KEN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => null],
//     ['year' => 2023, 'month' => 'July', 'db_name' => 'DARWIN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 4930],
//     ['year' => 2023, 'month' => 'July', 'db_name' => 'ROMANO', 'absences_score' => 5.00, 'tardiness_score' => 1.00, 'id' => null],
//     ['year' => 2023, 'month' => 'July', 'db_name' => 'DON', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 2846],
//     ['year' => 2023, 'month' => 'July', 'db_name' => 'JOHNCRIS', 'absences_score' => 5.00, 'tardiness_score' => 0, 'id' => null],
//     ['year' => 2023, 'month' => 'July', 'db_name' => 'VINCENT', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'id' => 9777],
//     ['year' => 2023, 'month' => 'July', 'db_name' => 'LYNJE', 'absences_score' => 5.00, 'tardiness_score' => 0, 'id' => null],

//     ['year' => 2023, 'month' => 'August', 'db_name' => 'RUSTAN', 'absences_score' => 3.00, 'tardiness_score' => 2.400, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 2394],
//     ['year' => 2023, 'month' => 'August', 'db_name' => 'SALLY', 'absences_score' => 5.00, 'tardiness_score' => 4.000, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 2470],
//     ['year' => 2023, 'month' => 'August', 'db_name' => 'NEL', 'absences_score' => 4.00, 'tardiness_score' => 3.200, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 2856],
//     ['year' => 2023, 'month' => 'August', 'db_name' => 'RUFFY', 'absences_score' => 3.00, 'tardiness_score' => 2.400, 'score_1' => 3.00, 'score_2' => 5.00, 'id' => 7870],
//     ['year' => 2023, 'month' => 'August', 'db_name' => 'XANDER', 'absences_score' => 5.00, 'tardiness_score' => 4.000, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => null],
//     ['year' => 2023, 'month' => 'August', 'db_name' => 'MHEL', 'absences_score' => 5.00, 'tardiness_score' => 4.000, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 2852],
//     ['year' => 2023, 'month' => 'August', 'db_name' => 'RANDY', 'absences_score' => 5.00, 'tardiness_score' => 4.000, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 11422],
//     ['year' => 2023, 'month' => 'August', 'db_name' => 'JOMAN', 'absences_score' => 5.00, 'tardiness_score' => 4.000, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 2858],
//     ['year' => 2023, 'month' => 'August', 'db_name' => 'CCUNANAN', 'absences_score' => 5.00, 'tardiness_score' => 4.000, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 9721],
//     ['year' => 2023, 'month' => 'August', 'db_name' => 'JHUN', 'absences_score' => 4.00, 'tardiness_score' => 3.200, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 3002],
//     ['year' => 2023, 'month' => 'August', 'db_name' => 'CHRIS', 'absences_score' => 4.00, 'tardiness_score' => 3.200, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 10359],
//     ['year' => 2023, 'month' => 'August', 'db_name' => 'ARLENE', 'absences_score' => 1.00, 'tardiness_score' => 0.800, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 8059],
//     ['year' => 2023, 'month' => 'August', 'db_name' => 'IVANN', 'absences_score' => 4.00, 'tardiness_score' => 3.200, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 4933],
//     ['year' => 2023, 'month' => 'August', 'db_name' => 'MACEDO', 'absences_score' => 4.00, 'tardiness_score' => 3.200, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 11421],
//     ['year' => 2023, 'month' => 'August', 'db_name' => 'MARIE', 'absences_score' => 4.00, 'tardiness_score' => 3.200, 'score_1' => 5.00, 'score_2' => 3.00, 'id' => 6379],
//     ['year' => 2023, 'month' => 'August', 'db_name' => 'BRY', 'absences_score' => 2.00, 'tardiness_score' => 1.600, 'score_1' => 5.00, 'score_2' => 3.00, 'id' => 2472],
//     ['year' => 2023, 'month' => 'August', 'db_name' => 'PJ', 'absences_score' => 2.00, 'tardiness_score' => 1.600, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 5561],
//     ['year' => 2023, 'month' => 'August', 'db_name' => 'KEN', 'absences_score' => 3.00, 'tardiness_score' => 2.400, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => null],
//     ['year' => 2023, 'month' => 'August', 'db_name' => 'DARWIN', 'absences_score' => 3.00, 'tardiness_score' => 2.400, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 4930],
//     ['year' => 2023, 'month' => 'August', 'db_name' => 'ROMANO', 'absences_score' => 4.00, 'tardiness_score' => 3.200, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => null],
//     ['year' => 2023, 'month' => 'August', 'db_name' => 'DON', 'absences_score' => 4.00, 'tardiness_score' => 3.200, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 2846],
//     ['year' => 2023, 'month' => 'August', 'db_name' => 'JOHNCRIS', 'absences_score' => 3.00, 'tardiness_score' => 2.400, 'score_1' => 5.00, 'score_2' => 3.00, 'id' => null],
//     ['year' => 2023, 'month' => 'August', 'db_name' => 'VINCENT', 'absences_score' => 3.00, 'tardiness_score' => 2.400, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 9777],
//     ['year' => 2023, 'month' => 'August', 'db_name' => 'LYNJE', 'absences_score' => 5.00, 'tardiness_score' => 4.000, 'score_1' => null, 'score_2' => 3.00, 'id' => null],

//     ['year' => 2023, 'month' => 'September', 'db_name' => 'RUSTAN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 2394],
//     ['year' => 2023, 'month' => 'September', 'db_name' => 'SALLY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 2470],
//     ['year' => 2023, 'month' => 'September', 'db_name' => 'NEL', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 2856],
//     ['year' => 2023, 'month' => 'September', 'db_name' => 'RUFFY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 7870],
//     ['year' => 2023, 'month' => 'September', 'db_name' => 'XANDER', 'absences_score' => 5.00, 'tardiness_score' => 3.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => null],
//     ['year' => 2023, 'month' => 'September', 'db_name' => 'MHEL', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 2852],
//     ['year' => 2023, 'month' => 'September', 'db_name' => 'RANDY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 11422],
//     ['year' => 2023, 'month' => 'September', 'db_name' => 'JOMAN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 2858],
//     ['year' => 2023, 'month' => 'September', 'db_name' => 'CCUNANAN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 9721],
//     ['year' => 2023, 'month' => 'September', 'db_name' => 'JHUN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 3002],
//     ['year' => 2023, 'month' => 'September', 'db_name' => 'CHRIS', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 10359],
//     ['year' => 2023, 'month' => 'September', 'db_name' => 'ARLENE', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 8059],
//     ['year' => 2023, 'month' => 'September', 'db_name' => 'DAISY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 2870],
//     ['year' => 2023, 'month' => 'September', 'db_name' => 'IVANN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 4933],
//     ['year' => 2023, 'month' => 'September', 'db_name' => 'MACEDO', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 11421],
//     ['year' => 2023, 'month' => 'September', 'db_name' => 'MARIE', 'absences_score' => 5.00, 'tardiness_score' => 1.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 6379],
//     ['year' => 2023, 'month' => 'September', 'db_name' => 'BRY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 2472],
//     ['year' => 2023, 'month' => 'September', 'db_name' => 'PJ', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 5561],
//     ['year' => 2023, 'month' => 'September', 'db_name' => 'DARWIN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 4930],
//     ['year' => 2023, 'month' => 'September', 'db_name' => 'DON', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 2846],
//     ['year' => 2023, 'month' => 'September', 'db_name' => 'VINCENT', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 9777],

//     ['year' => 2023, 'month' => 'October', 'db_name' => 'RUSTAN', 'absences_score' => 5.00, 'tardiness_score' => 3.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 2394],
//     ['year' => 2023, 'month' => 'October', 'db_name' => 'SALLY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 2470],
//     ['year' => 2023, 'month' => 'October', 'db_name' => 'NEL', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 2856],
//     ['year' => 2023, 'month' => 'October', 'db_name' => 'RUFFY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 7870],
//     ['year' => 2023, 'month' => 'October', 'db_name' => 'XANDER', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => null],
//     ['year' => 2023, 'month' => 'October', 'db_name' => 'MHEL', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 2852],
//     ['year' => 2023, 'month' => 'October', 'db_name' => 'RANDY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 11422],
//     ['year' => 2023, 'month' => 'October', 'db_name' => 'JOMAN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 2858],
//     ['year' => 2023, 'month' => 'October', 'db_name' => 'CCUNANAN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 9721],
//     ['year' => 2023, 'month' => 'October', 'db_name' => 'JHUN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 3002],
//     ['year' => 2023, 'month' => 'October', 'db_name' => 'CHRIS', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 10359],
//     ['year' => 2023, 'month' => 'October', 'db_name' => 'ARLENE', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 8059],
//     ['year' => 2023, 'month' => 'October', 'db_name' => 'DAISY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 2870],
//     ['year' => 2023, 'month' => 'October', 'db_name' => 'IVANN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 4933],
//     ['year' => 2023, 'month' => 'October', 'db_name' => 'MACEDO', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 11421],
//     ['year' => 2023, 'month' => 'October', 'db_name' => 'MARIE', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 6379],
//     ['year' => 2023, 'month' => 'October', 'db_name' => 'BRY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 2472],
//     ['year' => 2023, 'month' => 'October', 'db_name' => 'PJ', 'absences_score' => 3.00, 'tardiness_score' => 3.00, 'score_1' => 3.00, 'score_2' => 3.00, 'id' => 5561],
//     ['year' => 2023, 'month' => 'October', 'db_name' => 'DARWIN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 4930],
//     ['year' => 2023, 'month' => 'October', 'db_name' => 'ROMANO', 'absences_score' => 3.00, 'tardiness_score' => 5.00, 'score_1' => 3.00, 'score_2' => 5.00, 'id' => null],
//     ['year' => 2023, 'month' => 'October', 'db_name' => 'DON', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 2846],
//     ['year' => 2023, 'month' => 'October', 'db_name' => 'JOHNCRIS', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => null],
//     ['year' => 2023, 'month' => 'October', 'db_name' => 'VINCENT', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 9777],
//     ['year' => 2023, 'month' => 'October', 'db_name' => 'LYNJE', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => null],

//     ['year' => 2023, 'month' => 'November', 'db_name' => 'RUSTAN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 2394],
//     ['year' => 2023, 'month' => 'November', 'db_name' => 'SALLY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 2470],
//     ['year' => 2023, 'month' => 'November', 'db_name' => 'NEL', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 2856],
//     ['year' => 2023, 'month' => 'November', 'db_name' => 'RUFFY', 'absences_score' => 5.00, 'tardiness_score' => 1.00, 'score_1' => 5.00, 'score_2' => 1.00, 'id' => 7870],
//     ['year' => 2023, 'month' => 'November', 'db_name' => 'XANDER', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => null],
//     ['year' => 2023, 'month' => 'November', 'db_name' => 'MHEL', 'absences_score' => 5.00, 'tardiness_score' => 3.00, 'score_1' => 5.00, 'score_2' => 3.00, 'id' => 2852],
//     ['year' => 2023, 'month' => 'November', 'db_name' => 'RANDY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 11422],
//     ['year' => 2023, 'month' => 'November', 'db_name' => 'JOMAN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 2858],
//     ['year' => 2023, 'month' => 'November', 'db_name' => 'CCUNANAN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 9721],
//     ['year' => 2023, 'month' => 'November', 'db_name' => 'JHUN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 3002],
//     ['year' => 2023, 'month' => 'November', 'db_name' => 'CHRIS', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 10359],
//     ['year' => 2023, 'month' => 'November', 'db_name' => 'ARLENE', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 8059],
//     // ['year' => 2023, 'month' => 'November', 'db_name' => 'DAISY', 'absences_score' => null, 'tardiness_score' => null, 'score_1' => null, 'score_2' => null, 'id' => 2870],
//     ['year' => 2023, 'month' => 'November', 'db_name' => 'IVANN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 4933],
//     ['year' => 2023, 'month' => 'November', 'db_name' => 'MACEDO', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 11421],
//     ['year' => 2023, 'month' => 'November', 'db_name' => 'MARIE', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 6379],
//     ['year' => 2023, 'month' => 'November', 'db_name' => 'BRY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 2472],
//     ['year' => 2023, 'month' => 'November', 'db_name' => 'PJ', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 5561],
//     ['year' => 2023, 'month' => 'November', 'db_name' => 'DARWIN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 4930],
//     ['year' => 2023, 'month' => 'November', 'db_name' => 'DON', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 2846],
//     ['year' => 2023, 'month' => 'November', 'db_name' => 'VINCENT', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 9777],

//     ['year' => 2023, 'month' => 'December', 'db_name' => 'RUSTAN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 2394],
//     ['year' => 2023, 'month' => 'December', 'db_name' => 'SALLY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 2470],
//     ['year' => 2023, 'month' => 'December', 'db_name' => 'NEL', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 2856],
//     ['year' => 2023, 'month' => 'December', 'db_name' => 'RUFFY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 7870],
//     ['year' => 2023, 'month' => 'December', 'db_name' => 'XANDER', 'absences_score' => 5.00, 'tardiness_score' => 3.00, 'score_1' => 5.00, 'score_2' => 3.00, 'id' => null],
//     ['year' => 2023, 'month' => 'December', 'db_name' => 'MHEL', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 2852],
//     ['year' => 2023, 'month' => 'December', 'db_name' => 'RANDY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 11422],
//     ['year' => 2023, 'month' => 'December', 'db_name' => 'JOMAN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 2858],
//     ['year' => 2023, 'month' => 'December', 'db_name' => 'CCUNANAN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 9721],
//     ['year' => 2023, 'month' => 'December', 'db_name' => 'JHUN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 3002],
//     ['year' => 2023, 'month' => 'December', 'db_name' => 'CHRIS', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 10359],
//     ['year' => 2023, 'month' => 'December', 'db_name' => 'ARLENE', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 8059],
//     ['year' => 2023, 'month' => 'December', 'db_name' => 'DAISY', 'absences_score' => 5.00, 'tardiness_score' => 3.00, 'score_1' => 5.00, 'score_2' => 3.00, 'id' => 2870],
//     ['year' => 2023, 'month' => 'December', 'db_name' => 'IVANN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 4933],
//     ['year' => 2023, 'month' => 'December', 'db_name' => 'MACEDO', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 11421],
//     ['year' => 2023, 'month' => 'December', 'db_name' => 'MARIE', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 6379],
//     ['year' => 2023, 'month' => 'December', 'db_name' => 'BRY', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 2472],
//     ['year' => 2023, 'month' => 'December', 'db_name' => 'PJ', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 5561],
//     ['year' => 2023, 'month' => 'December', 'db_name' => 'DARWIN', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 4930],
//     ['year' => 2023, 'month' => 'December', 'db_name' => 'ROMANO', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => null],
//     ['year' => 2023, 'month' => 'December', 'db_name' => 'DON', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 2846],
//     ['year' => 2023, 'month' => 'December', 'db_name' => 'JOHNCRIS', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => null],
//     ['year' => 2023, 'month' => 'December', 'db_name' => 'VINCENT', 'absences_score' => 5.00, 'tardiness_score' => 5.00, 'score_1' => 5.00, 'score_2' => 5.00, 'id' => 9777]
    

// ];





// // Data array
// $data = [
//     ['month' => 'September', 'year' => 2024, 'db_name' => 'RUSTAN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2394],
//     ['month' => 'September', 'year' => 2024, 'db_name' => 'SALLY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2470],
//     ['month' => 'September', 'year' => 2024, 'db_name' => 'NEL', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2856],
//     ['month' => 'September', 'year' => 2024, 'db_name' => 'RUFFY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 7870],
//     ['month' => 'September', 'year' => 2024, 'db_name' => 'MHEL', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2852],
//     ['month' => 'September', 'year' => 2024, 'db_name' => 'RANDY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 11422],
//     ['month' => 'September', 'year' => 2024, 'db_name' => 'JOMAN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2858],
//     ['month' => 'September', 'year' => 2024, 'db_name' => 'CCUNANAN', 'absences_score' => 5, 'tardiness_score' => 0, 'id' => 9721],
//     ['month' => 'September', 'year' => 2024, 'db_name' => 'JHUN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 3002],
//     ['month' => 'September', 'year' => 2024, 'db_name' => 'CHRIS', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 10359],
//     ['month' => 'September', 'year' => 2024, 'db_name' => 'ARLENE', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 8059],
//     ['month' => 'September', 'year' => 2024, 'db_name' => 'DAISY', 'absences_score' => 3, 'tardiness_score' => 1, 'id' => 2870],
//     ['month' => 'September', 'year' => 2024, 'db_name' => 'IVANN', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 4933],
//     ['month' => 'September', 'year' => 2024, 'db_name' => 'MACEDO', 'absences_score' => 5, 'tardiness_score' => 1, 'id' => 11421],
//     ['month' => 'September', 'year' => 2024, 'db_name' => 'MARIE', 'absences_score' => 3, 'tardiness_score' => 3, 'id' => 6379],
//     ['month' => 'September', 'year' => 2024, 'db_name' => 'BRY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2472],
//     ['month' => 'September', 'year' => 2024, 'db_name' => 'PJ', 'absences_score' => 1, 'tardiness_score' => 1, 'id' => 5561],
//     ['month' => 'September', 'year' => 2024, 'db_name' => 'DARWIN', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 4930],
//     ['month' => 'September', 'year' => 2024, 'db_name' => 'DON', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2846],
//     ['month' => 'September', 'year' => 2024, 'db_name' => 'VINCENT', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 9777],
//     ['month' => 'October', 'year' => 2024, 'db_name' => 'RUSTAN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2394],
//     ['month' => 'October', 'year' => 2024, 'db_name' => 'SALLY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2470],
//     ['month' => 'October', 'year' => 2024, 'db_name' => 'NEL', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2856],
//     ['month' => 'October', 'year' => 2024, 'db_name' => 'RUFFY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 7870],
//     ['month' => 'October', 'year' => 2024, 'db_name' => 'MHEL', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2852],
//     ['month' => 'October', 'year' => 2024, 'db_name' => 'RANDY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 11422],
//     ['month' => 'October', 'year' => 2024, 'db_name' => 'JOMAN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2858],
//     ['month' => 'October', 'year' => 2024, 'db_name' => 'CCUNANAN', 'absences_score' => 5, 'tardiness_score' => 3, 'id' => 9721],
//     ['month' => 'October', 'year' => 2024, 'db_name' => 'JHUN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 3002],
//     ['month' => 'October', 'year' => 2024, 'db_name' => 'CHRIS', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 10359],
//     ['month' => 'October', 'year' => 2024, 'db_name' => 'ARLENE', 'absences_score' => 5, 'tardiness_score' => 1, 'id' => 8059],
//     ['month' => 'October', 'year' => 2024, 'db_name' => 'DAISY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2870],
//     ['month' => 'October', 'year' => 2024, 'db_name' => 'IVANN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 4933],
//     ['month' => 'October', 'year' => 2024, 'db_name' => 'MACEDO', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 11421],
//     ['month' => 'October', 'year' => 2024, 'db_name' => 'MARIE', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 6379],
//     ['month' => 'October', 'year' => 2024, 'db_name' => 'BRY', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 2472],
//     ['month' => 'October', 'year' => 2024, 'db_name' => 'PJ', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 5561],
//     ['month' => 'October', 'year' => 2024, 'db_name' => 'DARWIN', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 4930],
//     ['month' => 'October', 'year' => 2024, 'db_name' => 'DON', 'absences_score' => 3, 'tardiness_score' => 5, 'id' => 2846],
//     ['month' => 'October', 'year' => 2024, 'db_name' => 'VINCENT', 'absences_score' => 5, 'tardiness_score' => 5, 'id' => 9777],
// ];

    // Helper function to get a random date within a month and year
function getRandomDate($month, $year) {
    $startDate = "$year-$month-01";
    $endDate = date("Y-m-t", strtotime($startDate));
    return date("Y-m-d", mt_rand(strtotime($startDate), strtotime($endDate)));
}

foreach ($data as $row) {
    $agent_id = $row['id'];
    $month = $row['month'];
    $year = $row['year'];
    $absences_score = $row['absences_score'];
    $tardiness_score = $row['tardiness_score'];

    // Determine the number of entries to insert
    $absences_to_insert = 0;
    if ($absences_score == 3) {
        $absences_to_insert = 1;
    } elseif ($absences_score == 1) {
        $absences_to_insert = 2;
    } elseif ($absences_score == 0) {
        $absences_to_insert = 3;
    }

    //Dermine the number of tardiness entry to insert
    //

    $tardiness_to_insert = 0;
    if ($tardiness_score == 3){
       $tardiness_to_insert = 1;
    }elseif ($tardiness_score == 1){
      $tardiness_to_insert  = 2;
    }elseif ($tardiness_score == 0 ){
      $tardiness_to_insert  = 3;
    }

    // Insert into absences table
    for ($i = 1; $i <= $absences_to_insert; $i++) {

        //Dont insert anythin if  the absences_score = 5
        if ($absences_score == 5 ){
          echo "$agent_id". " has no absent ";
                continue;
        }
        $random_date = getRandomDate(date("m", strtotime($month)), $year);
        echo($random_date);
        $description = ($i == 1) ? "First absent" : (($i == 2) ? "Second absent" : "Third absent");
        
        if ($agent_id == null){
            echo "Dont add this records";
            continue;
        }
        $sql = "INSERT INTO absences (agent_id, month, year, date, description)
                VALUES ('$agent_id', '$month', '$year', '$random_date', '$description')";

        if ($conn->query($sql) === TRUE) {
            echo "New record created successfully for agent_id $agent_id\n";
        } else {
            echo "Error: " . $sql . "\n" . $conn->error;
        }
    }

    //Insert into tardiness table

    for ($i = 1; $i <= $tardiness_to_insert; $i++) {

             //Dont insert anything if  the tardiness_score = 5
        if ($tardiness_score == 5 ){
          echo "$agent_id". " has no tardiness ";
                continue;
        }

        $random_date = getRandomDate(date("m", strtotime($month)), $year);
        echo($random_date);
        $description = ($i == 1) ? "First tardiness" : (($i == 2) ? "Second tardiness" : "Third tardiness");
        
        if ($agent_id == null){
            echo "Dont add this records";
            continue;
        }
        $sql = "INSERT INTO tardiness (agent_id, month, year, date, description)
                VALUES ('$agent_id', '$month', '$year', '$random_date', '$description')";

        if ($conn->query($sql) === TRUE) {
            echo "New record created successfully for agent_id $agent_id\n";
        } else {
            echo "Error: " . $sql . "\n" . $conn->error;
        }
    }

}

$conn->close();
?>
