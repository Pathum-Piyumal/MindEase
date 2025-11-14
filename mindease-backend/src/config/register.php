<?php
include "db.php";

$name = $_POST["name"];
$email = $_POST["email"];
$password = $_POST["password"];

// Hash password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Insert into DB
$sql = "INSERT INTO users (name, email, password) VALUES ('$name', '$email', '$hashedPassword')";

if (mysqli_query($conn, $sql)) {
    echo "success";
} else {
    echo "error";
}

?>
