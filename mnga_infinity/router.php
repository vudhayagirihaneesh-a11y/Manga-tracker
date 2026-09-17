<?php
$path = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
if (preg_match('#^/api/#', $path)) {
    include 'api.php';
} else {
    if ($path !== '/' && file_exists(__DIR__ . $path) && !is_dir(__DIR__ . $path)) {
        return false;
    } else {
        include 'index.html';
    }
}
