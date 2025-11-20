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
$mood = isset($_POST['mood']) ? trim($_POST['mood']) : '';
$notes = isset($_POST['notes']) ? trim($_POST['notes']) : '';

if (!$user_id) {
    echo json_encode(['status' => 'error', 'message' => 'not_logged_in']);
    exit;
}

if (empty($mood)) {
    echo json_encode(['status' => 'error', 'message' => 'empty_mood']);
    exit;
}

// Validate mood values
$valid_moods = ['happy', 'calm', 'anxious', 'sad', 'angry'];
if (!in_array($mood, $valid_moods)) {
    echo json_encode(['status' => 'error', 'message' => 'invalid_mood']);
    exit;
}

$conn = getDBConnection();

$stmt = $conn->prepare("INSERT INTO mood_entries (user_id, mood, notes) VALUES (?, ?, ?)");
$stmt->bind_param("iss", $user_id, $mood, $notes);

if ($stmt->execute()) {
    $entry_id = $stmt->insert_id;
    
    echo json_encode([
        'status' => 'success',
        'message' => 'mood_saved',
        'entry_id' => $entry_id
    ]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'save_failed']);
}

$stmt->close();
$conn->close();
?>