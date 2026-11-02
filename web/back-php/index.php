<?php
$dist = realpath(__DIR__ . '/../front/dist');
$path = realpath($dist . parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

if (!$path || !is_file($path) || strpos($path, $dist) !== 0) $path = "$dist/index.html";

$fileType = [
        'js' => 'text/javascript',
        'css' => 'text/css',
        'svg' => 'image/svg+xml',
        'html' => 'text/html'
    ][pathinfo($path, PATHINFO_EXTENSION)] ?? mime_content_type($path);

header("Content-Type: $fileType");

error_log("debug read file: $path => $fileType");
readfile($path);
