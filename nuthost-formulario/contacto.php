<?php
/* Formulario de doctoravanesaklima.com.ar
   Diseño y desarrollo: Estudio Ideamos — https://ideamos.com.ar/ */
const TO='klivanedoc@gmail.com';
const TO_RECIPES='pedidoreceta@gmail.com';
const FROM='formularios@doctoravanesaklima.com.ar';
$ORIGINS=array('https://doctoravanesaklima.com.ar','https://www.doctoravanesaklima.com.ar');
$MOTIVES=array('Medicina familiar','Diabetes','PAMI','Videoconsulta','Domicilio en Tigre','Recetas particulares','Otra consulta');
ini_set('display_errors','0');
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store, max-age=0');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header("Content-Security-Policy: default-src 'none'; frame-ancestors 'none'; base-uri 'none'");
header('Permissions-Policy: camera=(), microphone=(), geolocation=()');
set_exception_handler(function($error){error_log('VK form: unexpected exception');reply(503,['ok'=>false,'message'=>'El formulario no está disponible. Escribinos por WhatsApp.']);});

header('Referrer-Policy: strict-origin-when-cross-origin');
function reply($code,$data){http_response_code($code);echo json_encode($data,JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);exit;}
function formLength($v){return function_exists('mb_strlen')?mb_strlen($v,'UTF-8'):strlen($v);}
function field($key){$v=isset($_POST[$key])?$_POST[$key]:'';if(!is_string($v))return '';$v=str_replace(["\r\n","\r"],"\n",trim($v));return preg_match('//u',$v)===1?$v:'';}
function allowed($origin){global $ORIGINS;return in_array($origin,$ORIGINS,true);}
$method=strtoupper(isset($_SERVER['REQUEST_METHOD'])?$_SERVER['REQUEST_METHOD']:'GET');
$origin=trim(isset($_SERVER['HTTP_ORIGIN'])?$_SERVER['HTTP_ORIGIN']:'');
if($origin!==''&&allowed($origin)){header('Access-Control-Allow-Origin: '.$origin);header('Vary: Origin');}
if($method==='OPTIONS'){if(!allowed($origin))reply(403,['ok'=>false,'message'=>'Origen no permitido.']);header('Access-Control-Allow-Methods: POST, OPTIONS');header('Access-Control-Allow-Headers: Accept');header('Access-Control-Max-Age: 600');http_response_code(204);exit;}
if($method==='GET')reply(200,['ok'=>true,'service'=>'formulario-contacto','status'=>'ready']);
if($method!=='POST'){header('Allow: GET, POST, OPTIONS');reply(405,['ok'=>false,'message'=>'Método no permitido.']);}
$referer=trim(isset($_SERVER['HTTP_REFERER'])?$_SERVER['HTTP_REFERER']:'');$refOk=false;
foreach($ORIGINS as $ok){if($referer!==''&&strpos($referer,$ok.'/')===0){$refOk=true;break;}}
if(($origin!==''&&!allowed($origin))||($origin===''&&!$refOk))reply(403,['ok'=>false,'message'=>'No se pudo validar el origen del formulario.']);
$contentType=strtolower(trim(explode(';',isset($_SERVER['CONTENT_TYPE'])?$_SERVER['CONTENT_TYPE']:'')[0]));
if(!in_array($contentType,['multipart/form-data','application/x-www-form-urlencoded'],true))reply(415,['ok'=>false,'message'=>'Formato de solicitud no permitido.']);
if(!empty($_FILES))reply(400,['ok'=>false,'message'=>'Este formulario no admite archivos adjuntos.']);
$size=(int)(isset($_SERVER['CONTENT_LENGTH'])?$_SERVER['CONTENT_LENGTH']:0);
if($size<=0||$size>32768)reply(413,['ok'=>false,'message'=>'La solicitud no tiene un tamaño válido.']);
if(field('website')!=='')reply(200,['ok'=>true,'message'=>'Tu consulta fue enviada correctamente.']);
$started=(int)field('form_started_at');$elapsed=(int)round(microtime(true)*1000)-$started;
if($started<=0||$elapsed<3500||$elapsed>7200000)reply(400,['ok'=>false,'message'=>'Actualizá la página y volvé a completar el formulario.']);
$name=field('Nombre');$email=strtolower(field('email'));$phone=field('Teléfono');$motive=field('Motivo');$message=field('Mensaje');$errors=[];
if(formLength($name)<3||formLength($name)>90||preg_match('/[<>\x00-\x1F\x7F]/',$name))$errors[]='Ingresá un nombre válido.';
if(!filter_var($email,FILTER_VALIDATE_EMAIL)||formLength($email)>190||preg_match('/[\r\n]/',$email))$errors[]='Ingresá un email válido.';
if(!preg_match('/^[0-9+() .-]{6,30}$/',$phone))$errors[]='Ingresá un teléfono válido.';
if(!in_array($motive,$MOTIVES,true))$errors[]='Seleccioná un motivo válido.';
if(formLength($message)<10||formLength($message)>2500||preg_match('/<\/?[a-z][^>]*>/i',$message))$errors[]='El mensaje debe tener entre 10 y 2500 caracteres.';
$spam=$name.' '.$message;preg_match_all('~(?:https?://|www\.)~i',$spam,$links);
if(count($links[0])>2||preg_match('/(.)\1{12,}/u',$spam))$errors[]='El mensaje fue rechazado por el filtro antispam.';
if($errors!==[])reply(422,['ok'=>false,'message'=>implode(' ',$errors)]);
// Private, bounded storage outside public_html. Never store messages or raw IPs.
function limiterUnavailable(){
    error_log('VK form: rate-limit storage unavailable');
    reply(503,['ok'=>false,'message'=>'El formulario no está disponible. Escribinos por WhatsApp.']);
}
$privateDir=dirname(__DIR__,2).DIRECTORY_SEPARATOR.'.vanesa-form-private';
umask(0077);
if(!is_dir($privateDir)&&!@mkdir($privateDir,0700,true)&&!is_dir($privateDir))limiterUnavailable();
$file=$privateDir.DIRECTORY_SEPARATOR.'rate-limit.json';
if(is_link($file))limiterUnavailable();
$handle=@fopen($file,'c+');
if($handle===false)limiterUnavailable();
if(!flock($handle,LOCK_EX|LOCK_NB)){fclose($handle);limiterUnavailable();}
$stat=fstat($handle);
if(!$stat||$stat['size']>65536){fclose($handle);limiterUnavailable();}
$saved=stream_get_contents($handle);
$decoded=$saved===''?[]:json_decode($saved,true);
if(!is_array($decoded)){fclose($handle);limiterUnavailable();}
$now=time();$tries=[];
foreach($decoded as $attempt){
    if(!is_array($attempt)||!isset($attempt['at'],$attempt['ip'])||!is_int($attempt['at'])||!is_string($attempt['ip'])){fclose($handle);limiterUnavailable();}
    if($attempt['at']>$now-900)$tries[]=$attempt;
}
$ip=hash('sha256',(isset($_SERVER['REMOTE_ADDR'])?$_SERVER['REMOTE_ADDR']:'unknown').'|'.__FILE__);
$localCount=count(array_filter($tries,function($attempt)use($ip){return $attempt['ip']===$ip;}));
if($localCount>=3||count($tries)>=60){
    fclose($handle);header('Retry-After: 900');
    reply(429,['ok'=>false,'message'=>'Recibimos varios intentos. Esperá unos minutos antes de volver a enviar.']);
}
$tries[]=['at'=>$now,'ip'=>$ip];
$encoded=json_encode($tries);
if($encoded===false||!rewind($handle)||!ftruncate($handle,0)||fwrite($handle,$encoded)!==strlen($encoded)||!fflush($handle)){fclose($handle);limiterUnavailable();}
flock($handle,LOCK_UN);fclose($handle);
$recipient=$motive==='Recetas particulares'?TO_RECIPES:TO;
$subject='=?UTF-8?B?'.base64_encode('Consulta web: '.$motive.' — '.$name).'?=';
$body=implode("\r\n",['Nueva consulta desde doctoravanesaklima.com.ar','','Nombre: '.$name,'Email: '.$email,'Teléfono: '.$phone,'Motivo: '.$motive,'','Mensaje:',$message,'','Enviado: '.date('Y-m-d H:i:s T')]);
$headers=implode("\r\n",['From: Formulario web <'.FROM.'>','Reply-To: '.$email,'MIME-Version: 1.0','Content-Type: text/plain; charset=UTF-8','Content-Transfer-Encoding: 8bit','Auto-Submitted: auto-generated','X-Mailer: Estudio Ideamos Formulario Web']);
if(!@mail($recipient,$subject,$body,$headers)){error_log('VK form: mail transport failure');reply(500,['ok'=>false,'message'=>'No pudimos enviar la consulta. Intentá nuevamente o escribinos por WhatsApp.']);}
reply(200,['ok'=>true,'message'=>'Tu consulta fue enviada correctamente. Te responderemos a la brevedad.']);
