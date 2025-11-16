<?php
/**
 * Database Configuration Template
 * 
 * SETUP INSTRUCTIONS:
 * 1. Copy this file as 'database.php' in the same folder
 * 2. Update DB_USER and DB_PASS with your MySQL credentials
 * 3. Make sure the database 'mindease_db' exists
 * 4. DO NOT commit database.php to Git (it's in .gitignore)
 */

// Database Configuration
define('DB_HOST', 'localhost');           // MySQL host
define('DB_USER', 'root');                // YOUR MySQL username
define('DB_PASS', '');                    // YOUR MySQL password
define('DB_NAME', 'mindease_db');         // Database name

// Create database connection
function getDBConnection() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    
    $conn->set_charset("utf8mb4");
    return $conn;
}

// Start session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Error reporting (DISABLE in production!)
error_reporting(E_ALL);
ini_set('display_errors', 1);
?>