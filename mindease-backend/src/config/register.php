<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Get form data
$name = $_POST["name"];
$email = $_POST["email"];
$password = $_POST["password"];

// Simple validation
if(empty($name) || empty($email) || empty($password)) {
    die("empty_fields");
}

include "db.php";

if (!$conn) {
    die("db_error");
}

// Check if email exists
$check = mysqli_query($conn, "SELECT id FROM users WHERE email = '$email'");
if (mysqli_num_rows($check) > 0) {
    die("email_exists");
}

// Hash password and insert
$hashed_password = password_hash($password, PASSWORD_DEFAULT);
$sql = "INSERT INTO users (name, email, password) VALUES ('$name', '$email', '$hashed_password')";

if (mysqli_query($conn, $sql)) {
    echo "success";
} else {
    echo "insert_error: " . mysqli_error($conn);
}

mysqli_close($conn);
?>