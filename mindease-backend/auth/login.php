<?php
include("../config/database.php");

$email = $_POST['email'];
$password = $_POST['password'];

$sql = "SELECT * FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 1) {
    $user = $result->fetch_assoc();

    if (password_verify($password, $user['password'])) {
        echo json_encode(["status" => "success", "user_id" => $user["id"]]);
    } else {
        echo "wrong_password";
    }
} else {
    echo "no_user";
}
?>
