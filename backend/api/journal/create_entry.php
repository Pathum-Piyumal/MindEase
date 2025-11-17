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
$title = isset($_POST['title']) ? trim($_POST['title']) : 'Untitled';
$content = isset($_POST['content']) ? trim($_POST['content']) : '';

if (!$user_id) {
    echo json_encode(['status' => 'error', 'message' => 'not_logged_in']);
    exit;
}

if (empty($content)) {
    echo json_encode(['status' => 'error', 'message' => 'empty_content']);
    exit;
}

$conn = getDBConnection();

$stmt = $conn->prepare("INSERT INTO journal_entries (user_id, title, content) VALUES (?, ?, ?)");
$stmt->bind_param("iss", $user_id, $title, $content);

if ($stmt->execute()) {
    $entry_id = $stmt->insert_id;
    
    echo json_encode([
        'status' => 'success',
        'message' => 'entry_created',
        'entry_id' => $entry_id
    ]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'create_failed']);
}

$stmt->close();
$conn->close();
?>

