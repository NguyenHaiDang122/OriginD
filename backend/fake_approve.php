<?php
require 'c:\Users\HP\Desktop\OriginD\backend\vendor\autoload.php';
$app = require_once 'c:\Users\HP\Desktop\OriginD\backend\bootstrap\app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$d = \App\Models\Deposit::where('status', 'pending')->orderBy('id', 'desc')->first();
if($d) { 
    $d->status = 'approved'; 
    $d->save(); 
    echo "Approved deposit ".$d->id; 
} else { 
    echo "No pending deposit"; 
}
