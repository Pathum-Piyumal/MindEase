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

if (empty($quote_text)) {
    echo json_encode(['status' => 'error', 'message' => 'empty_quote']);
    exit;
}

$conn = getDBConnection();

$is_liked = false;
$is_saved = false;
$like_count = 0;

// Check if user liked this quote
if ($user_id) {
    $like_stmt = $conn->prepare("SELECT id FROM quote_likes WHERE user_id = ? AND quote_text = ?");
    $like_stmt->bind_param("is", $user_id, $quote_text);
    $like_stmt->execute();
    $like_result = $like_stmt->get_result();
    $is_liked = ($like_result->num_rows > 0);
    $like_stmt->close();
    
    // Check if user saved this quote
    $save_stmt = $conn->prepare("SELECT id FROM saved_quotes WHERE user_id = ? AND quote_text = ?");
    $save_stmt->bind_param("is", $user_id, $quote_text);
    $save_stmt->execute();
    $save_result = $save_stmt->get_result();
    $is_saved = ($save_result->num_rows > 0);
    $save_stmt->close();
}

// Get total like count
$count_stmt = $conn->prepare("SELECT COUNT(*) as count FROM quote_likes WHERE quote_text = ?");
$count_stmt->bind_param("s", $quote_text);
$count_stmt->execute();
$count_result = $count_stmt->get_result();
$count_data = $count_result->fetch_assoc();
$like_count = $count_data['count'];
$count_stmt->close();

$conn->close();

echo json_encode([
    'status' => 'success',
    'is_liked' => $is_liked,
    'is_saved' => $is_saved,
    'like_count' => $like_count
]);
?>