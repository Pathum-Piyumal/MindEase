<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Content-Type: text/plain');

require_once '../config/database.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo "invalid_request";
    exit;
}

$email = isset($_POST['email']) ? trim($_POST['email']) : '';
$code = isset($_POST['code']) ? trim($_POST['code']) : '';
$password = isset($_POST['password']) ? trim($_POST['password']) : '';

if (empty($email) || empty($code) || empty($password)) {
    echo "empty_fields";
    exit;
}

if (strlen($password) < 6) {
    echo "password_too_short";
    exit;
}

$conn = getDBConnection();

// Check if code is valid and not expired
$stmt = $conn->prepare("
    SELECT id FROM password_resets 
    WHERE email = ? 
    AND reset_code = ? 
    AND used = 0 
    AND expires_at > NOW()
");
$stmt->bind_param("ss", $email, $code);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo "invalid_code";
    $stmt->close();
    $conn->close();
    exit;
}

$reset = $result->fetch_assoc();
$stmt->close();

// Hash new password
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// Update user password
$update_stmt = $conn->prepare("UPDATE users SET password = ? WHERE email = ?");
$update_stmt->bind_param("ss", $hashed_password, $email);

if ($update_stmt->execute()) {
    // Mark reset code as used
    $mark_used = $conn->prepare("UPDATE password_resets SET used = 1 WHERE id = ?");
    $mark_used->bind_param("i", $reset['id']);
    $mark_used->execute();
    $mark_used->close();
    
    echo "password_reset";
} else {
    echo "update_failed";
}

$update_stmt->close();
$conn->close();
?>