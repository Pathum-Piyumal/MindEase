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
$quote_text = isset($_POST['quote_text']) ? trim($_POST['quote_text']) : '';

if (!$user_id) {
    echo json_encode(['status' => 'error', 'message' => 'not_logged_in']);
    exit;
}

if (empty($quote_text)) {
    echo json_encode(['status' => 'error', 'message' => 'empty_quote']);
    exit;
}

$conn = getDBConnection();

// Check if quote is already saved
$check_stmt = $conn->prepare("SELECT id FROM saved_quotes WHERE user_id = ? AND quote_text = ?");
$check_stmt->bind_param("is", $user_id, $quote_text);
$check_stmt->execute();
$result = $check_stmt->get_result();

if ($result->num_rows > 0) {
    // Unsave - remove from saved
    $delete_stmt = $conn->prepare("DELETE FROM saved_quotes WHERE user_id = ? AND quote_text = ?");
    $delete_stmt->bind_param("is", $user_id, $quote_text);
    $delete_stmt->execute();
    $delete_stmt->close();
    
    $action = 'unsaved';
} else {
    // Save the quote
    $insert_stmt = $conn->prepare("INSERT INTO saved_quotes (user_id, quote_text) VALUES (?, ?)");
    $insert_stmt->bind_param("is", $user_id, $quote_text);
    
    if ($insert_stmt->execute()) {
        $action = 'saved';
    } else {
        echo json_encode(['status' => 'error', 'message' => 'save_failed']);
        $insert_stmt->close();
        $conn->close();
        exit;
    }
    $insert_stmt->close();
}

$check_stmt->close();
$conn->close();

echo json_encode([
    'status' => 'success',
    'action' => $action
]);
?>