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

// Get mood entries from last 30 days
$stmt = $conn->prepare("
    SELECT id, mood, notes, created_at 
    FROM mood_entries 
    WHERE user_id = ? 
    AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    ORDER BY created_at DESC
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$entries = [];
while ($row = $result->fetch_assoc()) {
    $entries[] = [
        'id' => $row['id'],
        'mood' => $row['mood'],
        'notes' => $row['notes'],
        'created_at' => $row['created_at']
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