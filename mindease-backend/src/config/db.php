<?php
$host = "localhost";
$user = "root"; // your XAMPP username
$pass = "";     // your XAMPP password
$dbname = "mindease";

$conn = mysqli_connect($host, $user, $pass, $dbname);

if (!$conn) {
    die("Database Connection Failed: " . mysqli_connect_error());
}
?>
