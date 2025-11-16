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

if (empty($email)) {
    echo "empty_email";
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo "invalid_email";
    exit;
}

$conn = getDBConnection();

// Check if user exists
$stmt = $conn->prepare("SELECT id, name FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo "email_not_found";
    $stmt->close();
    $conn->close();
    exit;
}

$user = $result->fetch_assoc();
$stmt->close();

// Generate 6-digit code
$reset_code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);

// Set expiration time (15 minutes from now)
$expires_at = date('Y-m-d H:i:s', strtotime('+15 minutes'));

// Delete old reset codes for this email
$delete_stmt = $conn->prepare("DELETE FROM password_resets WHERE email = ?");
$delete_stmt->bind_param("s", $email);
$delete_stmt->execute();
$delete_stmt->close();

// Insert new reset code
$insert_stmt = $conn->prepare("INSERT INTO password_resets (email, reset_code, expires_at) VALUES (?, ?, ?)");
$insert_stmt->bind_param("sss", $email, $reset_code, $expires_at);

if ($insert_stmt->execute()) {
    //  Send email with reset code
    
    $subject = "MindEase - Password Reset Code";
    $message = "Hi {$user['name']},\n\n";
    $message .= "Your password reset code is: $reset_code\n\n";
    $message .= "This code will expire in 15 minutes.\n\n";
    $message .= "If you didn't request this, please ignore this email.\n\n";
    $message .= "Thank you,\n";
    $message .= "The MindEase Team";
    
    $headers = "From: noreply@mindease.com\r\n";
    $headers .= "Reply-To: support@mindease.com\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    if (mail($email, $subject, $message, $headers)) {
        echo "code_sent";
    } else {
        // If email fails, log it but don't expose error to user
        error_log("Failed to send reset email to: $email");
        echo "email_failed";
    }
} else {
    echo "error_sending";
}

$insert_stmt->close();
$conn->close();
?>