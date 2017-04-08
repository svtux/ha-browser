<?php
/**
 * Save Hockey Arent game data processor
 */
Header('Access-Control-Allow-Origin: *');

$table = $_POST['table'];
$data = $_POST['data'] . "\n";

try {
	$dbfile = 'db/' . $table . '.txt';
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
