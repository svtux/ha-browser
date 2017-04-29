<?php
/**
 * Save game data processor
 */
Header('Access-Control-Allow-Origin: *');

$body = $_POST['body'];
$title = $_POST["title"];
$matchDate = $_POST['date'];

// $data = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' . $title . '</title></head><body>' . $body . '</body></html>';
$data = '<div id="innerTitle" class="hidden">' . $title . '</div><div id="innerContent">' . $body . '</div>';

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
} catch(Exception $e) {
	echo "0";
}