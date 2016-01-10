<?php
/**
 * Sponsor processor
 */
Header('Access-Control-Allow-Origin: *');

$data = $_POST['data']."\n";
$world = "3-2";

try {
	$dbfile = 'db/' . $world . '.txt';
	$adt = fopen($dbfile, 'x');
	if ($adt) {
		fwrite($adt, $data);
		fclose($adt);
	} else {
		file_put_contents($dbfile, $data, FILE_APPEND | LOCK_EX);
	}
	echo "1";
} catch(Exception $e) {
	echo "0";
}
