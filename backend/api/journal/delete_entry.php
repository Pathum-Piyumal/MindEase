<?php
session_start();

header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST');
header('Content-Type: application/json');

require_once '../../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['status' => 'error', 'message' => 'invalid_request']);
    exit;
}

$user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
$entry_id = isset($_POST['entry_id']) ? intval($_POST['entry_id']) : 0;

if (!$user_id) {
    echo json_encode(['status' => 'error', 'message' => 'not_logged_in']);
    exit;
}

if (empty($entry_id)) {
    echo json_encode(['status' => 'error', 'message' => 'invalid_entry_id']);
    exit;
}

$conn = getDBConnection();

// Delete only if entry belongs to user
$stmt = $conn->prepare("DELETE FROM journal_entries WHERE id = ? AND user_id = ?");
$stmt->bind_param("ii", $entry_id, $user_id);

if ($stmt->execute() && $stmt->affected_rows > 0) {
    echo json_encode([
        'status' => 'success',
        'message' => 'entry_deleted'
    ]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'delete_failed']);
}

$stmt->close();
$conn->close();
?>