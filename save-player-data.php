<?php
/**
 * Save game data processor
 */
Header('Access-Control-Allow-Origin: *');

$body = $_POST['body'];
$id = $_POST['id'];

try {
	$dbfile = 'db/players/' . $id . '.html';
	$adt = fopen($dbfile, 'x');
	if ($adt) {
		fwrite($adt, $body);
		fclose($adt);
	} else {
		file_put_contents($dbfile, $body, FILE_APPEND | LOCK_EX);
	}
	echo "1";
} catch (Exception $e) {
	echo "0";
}
