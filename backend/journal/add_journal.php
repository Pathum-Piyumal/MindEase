<?php
include("../config/database.php");

$user_id = $_POST["user_id"];
$title = $_POST["title"];
$content = $_POST["content"];

$sql = "INSERT INTO journals (user_id, title, content) VALUES (?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iss", $user_id, $title, $content);

if ($stmt->execute()) {
    echo "success";
} else {
    echo "error";
}
?>
