<?php
/**
 * Save Hockey Arena game data
 */
Header('Access-Control-Allow-Origin: *');

$table = $_POST['table'];
$matchID = $_POST['matchID'];
$playerID = $_POST['playerID'];
$schoolDate = $_POST['schoolDate'];
$trainingDate = $_POST['trainingDate'];
$body = $_POST['body'];

if (isset($table)) {
    $data = $_POST['data'] . "\n";

    $dbfile = 'db/' . $table . '.txt';
    saveDataToFile($dbfile, $data);
} else if (isset($matchID)) {
    $title = $_POST['title'];
    $matchDate = $_POST['date'];
    $data = '<div id="matchId_' . $matchID . '">'
        .'<input type="hidden" class="match-id" value="' . $matchID . '">'
        .'<input type="hidden" id="innerTitle_' . $matchID . '" value="' . $title .'">'
        .'<div id="matchContent_' . $matchID . '">' . $body . '</div></div>';

    $fileDir = 'db/games/' . $matchDate;

    try {
        if (!is_dir($fileDir)) {
            mkdir($fileDir);
        }
        $dbfile = $fileDir . '/' . $matchID . '.html';
        saveDataToFile($dbfile, $data);
    } catch (Exception $e) {
        echo "0";
    }
} else if (isset($playerID)) {
    $data = $body;
    $dbfile = 'db/players/' . $playerID . '.html';
    saveDataToFile($dbfile, $data);
} else if (isset($schoolDate)) {
    $dbfile = 'db/school/' . $schoolDate . '.html';
    saveDataToFile($dbfile, $body);
} else if (isset($trainingDate)) {
    $dbfile = 'db/training/' . $trainingDate . '.html';
    saveDataToFile($dbfile, $body);
}

function saveDataToFile($filename, $savingData) {
    try {
        $adt = fopen($filename, 'x');
        if ($adt) {
            fwrite($adt, $savingData);
            fclose($adt);
        } else {
            file_put_contents($filename, $savingData, FILE_APPEND | LOCK_EX);
        }
        echo "1";
    } catch (Exception $e) {
        echo "0";
    }
}