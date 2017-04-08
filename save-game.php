<?php
/**
 * Save game data processor
 */
Header('Access-Control-Allow-Origin: *');

$data = $_POST['data'];
$matchDate = $_POST['date'];

try {
	$dbfile = 'db/games/' . $matchDate . '.html';
	$adt = fopen($dbfile, 'x');
	if ($adt) {
		fwrite($adt, $data);
		fclose($adt);
	} else {
		file_put_contents($dbfile, $data, FILE_APPEND | LOCK_EX);
	}
	echo "1";
    // echo "Date: " . $data . ", date: " . $matchDate;
} catch(Exception $e) {
	echo "0";
}