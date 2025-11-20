<?php
header("Content-Type: application/json");

// meditation audio list
$meditations = [
    [
        "id" => 1,
        "title" => "Deep Relaxation",
        "duration" => "10:00",
        "url" => "/MindEase/public/audio/ambient.mp3"
    ],
    [
        "id" => 2,
        "title" => "Sleep Meditation",
        "duration" => "12:30",
        "url" => "/MindEase/public/audio/modern%20classic.mp3"
    ],
    [
        "id" => 3,
        "title" => "Focus Meditation",
        "duration" => "08:45",
        "url" => "/MindEase/public/audio/ambient.mp3"
    ]
];

echo json_encode($meditations);
?>
