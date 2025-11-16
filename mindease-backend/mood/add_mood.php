<?php
include("../config/database.php");

$user_id = $_POST["user_id"];
$mood = $_POST["mood"];
$note = $_POST["note"];

$sql = "INSERT INTO moods (user_id, mood, note) VALUES (?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iss", $user_id, $mood, $note);

if ($stmt->execute()) {
    echo "success";
} else {
    echo "error";
}
?>
