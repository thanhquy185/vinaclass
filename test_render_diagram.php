<?php
// Test drawing tree diagrams using PHP GD
$width = 2400;
$height = 1400;
$im = imagecreatetruecolor($width, $height);
imageantialias($im, true);

// Colors
$cBg = imagecolorallocate($im, 255, 255, 255);
imagefilledrectangle($im, 0, 0, $width, $height, $cBg);

$fontBold = '/System/Library/Fonts/Supplemental/Arial Bold.ttf';
$fontRegular = '/System/Library/Fonts/Supplemental/Arial.ttf';
if (!file_exists($fontBold)) $fontBold = '/Library/Fonts/Arial Unicode.ttf';
if (!file_exists($fontRegular)) $fontRegular = '/Library/Fonts/Arial Unicode.ttf';

echo "Using font: $fontBold\n";
echo "Renderer initialized.\n";
