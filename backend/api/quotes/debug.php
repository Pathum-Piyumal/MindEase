<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();

echo "<h2>Debug Info</h2>";
echo "<p><strong>Session ID:</strong> " . session_id() . "</p>";
echo "<p><strong>Logged in:</strong> " . (isset($_SESSION['user_id']) ? 'YES' : 'NO') . "</p>";

if (isset($_SESSION['user_id'])) {
    echo "<p><strong>User ID:</strong> " . $_SESSION['user_id'] . "</p>";
}

echo "<h3>Testing Database Connection:</h3>";

require_once '../../config/database.php';

try {
    $conn = getDBConnection();
    echo "<p style='color: green;'>✅ Database connected!</p>";
    
    // Check tables
    $tables = ['users', 'quote_likes', 'saved_quotes'];
    foreach ($tables as $table) {
        $result = $conn->query("SHOW TABLES LIKE '$table'");
        if ($result->num_rows > 0) {
            echo "<p style='color: green;'>✅ Table '$table' exists</p>";
        } else {
            echo "<p style='color: red;'>❌ Table '$table' NOT FOUND</p>";
        }
    }
    
    $conn->close();
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Database error: " . $e->getMessage() . "</p>";
}
?>