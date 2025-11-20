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

// Get all saved quotes for this user
$stmt = $conn->prepare("
    SELECT quote_text, saved_at 
    FROM saved_quotes 
    WHERE user_id = ? 
    ORDER BY saved_at DESC
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$saved_quotes = [];
while ($row = $result->fetch_assoc()) {
    $saved_quotes[] = [
        'quote_text' => $row['quote_text'],
        'saved_at' => $row['saved_at']
    ];
}

$stmt->close();
$conn->close();

echo json_encode([
    'status' => 'success',
    'quotes' => $saved_quotes,
    'count' => count($saved_quotes)
]);
?>