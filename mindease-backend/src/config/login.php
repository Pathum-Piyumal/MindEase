<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Check if the request is POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    die("Invalid request method");
}

// Check if required fields are set
if (!isset($_POST["email"]) || !isset($_POST["password"])) {
    die("Email and password are required");
}

$email = trim($_POST["email"]);
$password = $_POST["password"];

// Basic validation
if (empty($email) || empty($password)) {
    die("Email and password cannot be empty");
}

// Validate email format
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    die("Invalid email format");
}

// Include the database connection
// Make sure the path to db.php is correct relative to this file
include "db.php";

// Check if connection was successful
if (!$conn) {
    die("Database connection failed: " . mysqli_connect_error());
}

// Use prepared statements to prevent SQL injection
$sql = "SELECT id, email, password FROM users WHERE email = ?";
$stmt = mysqli_prepare($conn, $sql);

if ($stmt) {
    mysqli_stmt_bind_param($stmt, "s", $email);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);

    if (mysqli_num_rows($result) === 1) {
        $user = mysqli_fetch_assoc($result);

        // Check password
        if (password_verify($password, $user["password"])) {
            echo "success";
            
            // Optional: Start session and set user data
            // session_start();
            // $_SESSION['user_id'] = $user['id'];
            // $_SESSION['user_email'] = $user['email'];
        } else {
            echo "invalid";
        }
    } else {
        echo "notfound";
    }
    
    mysqli_stmt_close($stmt);
} else {
    echo "Database error: " . mysqli_error($conn);
}

mysqli_close($conn);
?>