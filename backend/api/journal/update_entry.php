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
$title = isset($_POST['title']) ? trim($_POST['title']) : '';
$content = isset($_POST['content']) ? trim($_POST['content']) : '';

if (!$user_id) {
    echo json_encode(['status' => 'error', 'message' => 'not_logged_in']);
    exit;
}

if (empty($entry_id) || empty($content)) {
    echo json_encode(['status' => 'error', 'message' => 'invalid_data']);
    exit;
}

$conn = getDBConnection();

// Verify entry belongs to user before updating
$check_stmt = $conn->prepare("SELECT id FROM journal_entries WHERE id = ? AND user_id = ?");
$check_stmt->bind_param("ii", $entry_id, $user_id);
$check_stmt->execute();
$check_result = $check_stmt->get_result();

if ($check_result->num_rows === 0) {
    echo json_encode(['status' => 'error', 'message' => 'not_authorized']);
    $check_stmt->close();
    $conn->close();
    exit;
}
$check_stmt->close();

// Update the entry
$stmt = $conn->prepare("UPDATE journal_entries SET title = ?, content = ? WHERE id = ? AND user_id = ?");
$stmt->bind_param("ssii", $title, $content, $entry_id, $user_id);

if ($stmt->execute()) {
    echo json_encode([
        'status' => 'success',
        'message' => 'entry_updated'
    ]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'update_failed']);
}

$stmt->close();
$conn->close();
?>