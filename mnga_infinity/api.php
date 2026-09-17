<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$dbFile = 'db.json';

function readDB() {
    global $dbFile;
    $defaultDb = ['manga' => []];
    if (!file_exists($dbFile)) {
        writeDB($defaultDb);
        return $defaultDb;
    }
    $content = file_get_contents($dbFile);
    if (trim($content) === '') {
        writeDB($defaultDb);
        return $defaultDb;
    }
    $db = json_decode($content, true);
    if (!is_array($db) || !isset($db['manga'])) {
        $db = ['manga' => []];
    }
    return $db;
}

function writeDB($data) {
    global $dbFile;
    file_put_contents($dbFile, json_encode($data, JSON_PRETTY_PRINT));
}

// Simple router based on request URI
$requestUri = $_SERVER['REQUEST_URI'];
// Remove query string
$path = parse_url($requestUri, PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];
$body = json_decode(file_get_contents('php://input'), true);

if (preg_match('#/api/search/(.+)#', $path, $matches) && $method === 'GET') {
    $query = urlencode(urldecode($matches[1]));
    $ch = curl_init("https://api.jikan.moe/v4/manga?q={$query}");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
    $response = curl_exec($ch);
    curl_close($ch);
    echo $response;
    exit(0);
}

if (preg_match('#/api/stats#', $path) && $method === 'GET') {
    $db = readDB();
    $mangaList = $db['manga'];
    
    $totalManga = count($mangaList);
    $completedManga = count(array_filter($mangaList, function($m) { return isset($m['status']) && $m['status'] === 'Completed'; }));
    $totalChaptersRead = 0;
    $historyMap = [];
    
    foreach ($mangaList as $m) {
        $totalChaptersRead += isset($m['chapters_read']) ? $m['chapters_read'] : 0;
        if (isset($m['reading_history']) && is_array($m['reading_history'])) {
            foreach ($m['reading_history'] as $entry) {
                if (!isset($historyMap[$entry['date']])) {
                    $historyMap[$entry['date']] = 0;
                }
                $historyMap[$entry['date']] += $entry['count'];
            }
        }
    }
    
    $readingHistory = [];
    foreach ($historyMap as $date => $count) {
        $readingHistory[] = ['date' => $date, 'count' => $count];
    }
    
    echo json_encode([
        'totalManga' => $totalManga,
        'completedManga' => $completedManga,
        'totalChaptersRead' => $totalChaptersRead,
        'readingHistory' => $readingHistory
    ]);
    exit(0);
}

if (preg_match('#/api/manga/import#', $path) && $method === 'POST') {
    $db = readDB();
    $importedManga = $body;
    
    if (!is_array($importedManga)) {
        http_response_code(400);
        echo json_encode(['message' => 'Invalid payload. Expected an array.']);
        exit(0);
    }
    
    $addedCount = 0;
    $updatedCount = 0;
    
    foreach ($importedManga as $incoming) {
        $existingIndex = -1;
        foreach ($db['manga'] as $index => $m) {
            if ($m['mal_id'] === $incoming['mal_id']) {
                $existingIndex = $index;
                break;
            }
        }
        
        if ($existingIndex >= 0) {
            $incoming['id'] = $db['manga'][$existingIndex]['id'];
            $db['manga'][$existingIndex] = $incoming;
            $updatedCount++;
        } else {
            $incoming['id'] = intval(microtime(true) * 1000) + mt_rand(1, 1000);
            array_unshift($db['manga'], $incoming);
            $addedCount++;
        }
    }
    
    writeDB($db);
    echo json_encode(['message' => 'Import successful', 'added' => $addedCount, 'updated' => $updatedCount]);
    exit(0);
}

if (preg_match('#/api/manga/(\d+)#', $path, $matches)) {
    $mangaId = intval($matches[1]);
    $db = readDB();
    $mangaIndex = -1;
    
    foreach ($db['manga'] as $index => $m) {
        if ($m['id'] === $mangaId) {
            $mangaIndex = $index;
            break;
        }
    }
    
    if ($mangaIndex === -1) {
        http_response_code(404);
        echo json_encode(['message' => 'Manga not found']);
        exit(0);
    }
    
    if ($method === 'PUT') {
        $existingManga = $db['manga'][$mangaIndex];
        
        $readingHistory = isset($existingManga['reading_history']) ? $existingManga['reading_history'] : [];
        $oldChaptersRead = isset($existingManga['chapters_read']) ? $existingManga['chapters_read'] : 0;
        $newChaptersRead = isset($body['chapters_read']) ? $body['chapters_read'] : $oldChaptersRead;
        
        if ($newChaptersRead > $oldChaptersRead) {
            $chaptersDiff = $newChaptersRead - $oldChaptersRead;
            $today = date('Y-m-d');
            
            $foundToday = false;
            foreach ($readingHistory as &$entry) {
                if ($entry['date'] === $today) {
                    $entry['count'] += $chaptersDiff;
                    $foundToday = true;
                    break;
                }
            }
            if (!$foundToday) {
                $readingHistory[] = ['date' => $today, 'count' => $chaptersDiff];
            }
        }
        
        $totalChapters = isset($existingManga['total_chapters']) ? $existingManga['total_chapters'] : null;
        if ($totalChapters > 0 && $newChaptersRead > $totalChapters) {
            http_response_code(400);
            echo json_encode(['message' => "Cannot exceed maximum chapter count of {$totalChapters}. You entered {$newChaptersRead}."]);
            exit(0);
        }
        
        $updatedManga = array_merge($existingManga, $body);
        $updatedManga['reading_history'] = $readingHistory;
        
        if (isset($updatedManga['total_chapters']) && $updatedManga['total_chapters'] === 0) {
            $updatedManga['total_chapters'] = null;
        }
        
        if (isset($updatedManga['total_chapters']) && $updatedManga['total_chapters'] > 0 && $updatedManga['chapters_read'] >= $updatedManga['total_chapters']) {
            $updatedManga['status'] = 'Completed';
        }
        
        $updatedManga['last_updated'] = intval(microtime(true) * 1000);
        
        $db['manga'][$mangaIndex] = $updatedManga;
        writeDB($db);
        echo json_encode($db['manga'][$mangaIndex]);
        exit(0);
    }
    
    if ($method === 'DELETE') {
        array_splice($db['manga'], $mangaIndex, 1);
        writeDB($db);
        http_response_code(204);
        exit(0);
    }
}

if (preg_match('#/api/manga#', $path)) {
    if ($method === 'GET') {
        $db = readDB();
        echo json_encode($db['manga']);
        exit(0);
    }
    
    if ($method === 'POST') {
        $db = readDB();
        $newMangaData = $body;
        
        foreach ($db['manga'] as $m) {
            if ($m['mal_id'] === $newMangaData['mal_id']) {
                http_response_code(409);
                echo json_encode(['message' => 'Manga already exists in the list.', 'manga' => $m]);
                exit(0);
            }
        }
        
        if (isset($newMangaData['total_chapters']) && $newMangaData['total_chapters'] === 0) {
            $newMangaData['total_chapters'] = null;
        }
        
        if (isset($newMangaData['total_chapters']) && $newMangaData['total_chapters'] > 0 && 
            isset($newMangaData['chapters_read']) && $newMangaData['chapters_read'] >= $newMangaData['total_chapters']) {
            $newMangaData['status'] = 'Completed';
        }
        
        $newMangaData['id'] = intval(microtime(true) * 1000);
        if (!isset($newMangaData['rating'])) $newMangaData['rating'] = 0;
        if (!isset($newMangaData['notes'])) $newMangaData['notes'] = "";
        if (!isset($newMangaData['tags'])) $newMangaData['tags'] = [];
        if (!isset($newMangaData['genres'])) $newMangaData['genres'] = [];
        $newMangaData['last_updated'] = $newMangaData['id'];
        
        array_unshift($db['manga'], $newMangaData);
        writeDB($db);
        http_response_code(201);
        echo json_encode($newMangaData);
        exit(0);
    }
}

http_response_code(404);
echo json_encode(['message' => 'Endpoint not found']);
