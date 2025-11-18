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

// Get mood counts for last 7 days
$week_stmt = $conn->prepare("
    SELECT mood, COUNT(*) as count 
    FROM mood_entries 
    WHERE user_id = ? 
    AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    GROUP BY mood
");
$week_stmt->bind_param("i", $user_id);
$week_stmt->execute();
$week_result = $week_stmt->get_result();

$weekly_moods = [];
$total_week = 0;
while ($row = $week_result->fetch_assoc()) {
    $weekly_moods[$row['mood']] = intval($row['count']);
    $total_week += intval($row['count']);
}
$week_stmt->close();

// Calculate positive mood percentage
$positive_moods = ['happy', 'calm'];
$positive_count = 0;
foreach ($positive_moods as $mood) {
    if (isset($weekly_moods[$mood])) {
        $positive_count += $weekly_moods[$mood];
    }
}

$positive_percentage = $total_week > 0 ? round(($positive_count / $total_week) * 100) : 0;

// Get most common mood
$most_common = '';
$max_count = 0;
foreach ($weekly_moods as $mood => $count) {
    if ($count > $max_count) {
        $max_count = $count;
        $most_common = $mood;
    }
}

// Get mood for today
$today_stmt = $conn->prepare("
    SELECT mood, created_at 
    FROM mood_entries 
    WHERE user_id = ? 
    AND DATE(created_at) = CURDATE()
    ORDER BY created_at DESC 
    LIMIT 1
");
$today_stmt->bind_param("i", $user_id);
$today_stmt->execute();
$today_result = $today_stmt->get_result();
$today_mood = $today_result->num_rows > 0 ? $today_result->fetch_assoc() : null;
$today_stmt->close();

$conn->close();

echo json_encode([
    'status' => 'success',
    'weekly_moods' => $weekly_moods,
    'total_entries' => $total_week,
    'positive_percentage' => $positive_percentage,
    'most_common_mood' => $most_common,
    'today_mood' => $today_mood
]);
?>