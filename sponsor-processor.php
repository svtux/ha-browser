<?php
/**
 * Sponsor processor
 */
Header('Access-Control-Allow-Origin: *');

$data = $_POST['data'];
$table = $_POST['table'];
$dir = $_POST['dir'];
$timestamp = $_POST['timestamp'];

try {
    $dbfile = 'db/' . $table . '/' . $dir . '/' . $timestamp . '.html';
    $adt = fopen($dbfile, 'x');
    if ($adt) {
        fwrite($adt, $data);
        fclose($adt);
    } else {
        file_put_contents($dbfile, $data, FILE_APPEND | LOCK_EX);
    }
    echo "1";
} catch (Exception $e) {
    echo "0";
}