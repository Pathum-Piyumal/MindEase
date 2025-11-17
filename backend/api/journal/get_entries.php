<?php
session_start();

header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET');
header('Content-Type: application/json');

require_once '../../config/database.php';

$user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

if (!$user_id) {
    echo json_encode(['status' => 'error', 'message' => 'not_logged_in']);
    exit;
}

$conn = getDBConnection();

// Get all entries for this user, ordered by newest first
$stmt = $conn->prepare("
    SELECT id, title, content, created_at, updated_at 
    FROM journal_entries 
    WHERE user_id = ? 
    ORDER BY created_at DESC
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$entries = [];
while ($row = $result->fetch_assoc()) {
    $entries[] = [
        'id' => $row['id'],
        'title' => $row['title'],
        'content' => $row['content'],
        'created_at' => $row['created_at'],
        'updated_at' => $row['updated_at']
    ];
}

$stmt->close();
$conn->close();

echo json_encode([
    'status' => 'success',
    'entries' => $entries,
    'count' => count($entries)
]);
?>