<?php
include("../config/database.php");

$user_id = $_GET["user_id"];

$sql = "SELECT * FROM journals WHERE user_id = ? ORDER BY created_at DESC";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();

$result = $stmt->get_result();

$journals = [];
while ($row = $result->fetch_assoc()) {
    $journals[] = $row;
}

echo json_encode($journals);
?>
