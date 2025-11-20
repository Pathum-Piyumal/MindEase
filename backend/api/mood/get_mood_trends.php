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

// Get period parameter (default to 'week', can be 'week' or 'month')
$period = isset($_GET['period']) ? $_GET['period'] : 'week';

$interval = $period === 'month' ? '30 DAY' : '7 DAY';

// Get mood counts per day for the period
$stmt = $conn->prepare("
    SELECT
        DATE(created_at) as date,
        mood,
        COUNT(*) as count
    FROM mood_entries
    WHERE user_id = ?
    AND created_at >= DATE_SUB(NOW(), INTERVAL $interval)
    GROUP BY DATE(created_at), mood
    ORDER BY date ASC, mood
");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$trends = [];
$daily_totals = [];
$mood_totals = [
    'happy' => 0,
    'calm' => 0,
    'anxious' => 0,
    'sad' => 0,
    'angry' => 0
];

while ($row = $result->fetch_assoc()) {
    $date = $row['date'];
    $mood = $row['mood'];
    $count = (int)$row['count'];

    if (!isset($trends[$date])) {
        $trends[$date] = [
            'date' => $date,
            'happy' => 0,
            'calm' => 0,
            'anxious' => 0,
            'sad' => 0,
            'angry' => 0,
            'total' => 0
        ];
    }

    $trends[$date][$mood] = $count;
    $trends[$date]['total'] += $count;
    $mood_totals[$mood] += $count;
}

// Convert to array and sort by date
$trends_array = array_values($trends);
usort($trends_array, function($a, $b) {
    return strtotime($a['date']) - strtotime($b['date']);
});

$stmt->close();
$conn->close();

echo json_encode([
    'status' => 'success',
    'period' => $period,
    'trends' => $trends_array,
    'mood_totals' => $mood_totals
]);
?>
