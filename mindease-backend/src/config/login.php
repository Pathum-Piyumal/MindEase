<?php
include "db.php";

$email = $_POST["email"];
$password = $_POST["password"];

$sql = "SELECT * FROM users WHERE email='$email'";
$result = mysqli_query($conn, $sql);

if (mysqli_num_rows($result) === 1) {
    $user = mysqli_fetch_assoc($result);

    // Check password
    if (password_verify($password, $user["password"])) {
        echo "success";
    } else {
        echo "invalid";
    }
} else {
    echo "notfound";
}
?>
