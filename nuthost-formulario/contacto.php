<?php
/* Formulario de doctoravanesaklima.com.ar
   Diseño y desarrollo: Estudio Ideamos — https://ideamos.com.ar/ */
const TO='klivanedoc@gmail.com';
const TO_RECIPES='pedidoreceta@gmail.com';
const FROM='formularios@doctoravanesaklima.com.ar';
$ORIGINS=array('https://doctoravanesaklima.com.ar','https://www.doctoravanesaklima.com.ar','https://estudioideamos.github.io');
$MOTIVES=array('Medicina familiar','Diabetes','PAMI','Videoconsulta','Domicilio en Tigre','Recetas particulares','Otra consulta');
ini_set('display_errors','0');
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store, max-age=0');
header('X-Content-Type-Options: nosniff');
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
if(($origin===''||!allowed($origin))&&!$refOk)reply(403,['ok'=>false,'message'=>'No se pudo validar el origen del formulario.']);
$size=(int)(isset($_SERVER['CONTENT_LENGTH'])?$_SERVER['CONTENT_LENGTH']:0);
if($size<=0||$size>32768)reply(413,['ok'=>false,'message'=>'La solicitud no tiene un tamaño válido.']);
if(field('website')!=='')reply(200,['ok'=>true,'message'=>'Tu consulta fue enviada correctamente.']);
$started=(int)field('form_started_at');$elapsed=(int)round(microtime(true)*1000)-$started;
if($started<=0||$elapsed<3500||$elapsed>7200000)reply(400,['ok'=>false,'message'=>'Actualizá la página y volvé a completar el formulario.']);
$name=field('Nombre');$email=strtolower(field('email'));$phone=field('Teléfono');$motive=field('Motivo');$message=field('Mensaje');$errors=[];
if(formLength($name)<3||formLength($name)>90||preg_match('/[<>]/',$name))$errors[]='Ingresá un nombre válido.';
if(!filter_var($email,FILTER_VALIDATE_EMAIL)||formLength($email)>190||preg_match('/[\r\n]/',$email))$errors[]='Ingresá un email válido.';
if(!preg_match('/^[0-9+() .-]{6,30}$/',$phone))$errors[]='Ingresá un teléfono válido.';
if(!in_array($motive,$MOTIVES,true))$errors[]='Seleccioná un motivo válido.';
if(formLength($message)<10||formLength($message)>2500||preg_match('/<\/?[a-z][^>]*>/i',$message))$errors[]='El mensaje debe tener entre 10 y 2500 caracteres.';
$spam=$name.' '.$message;preg_match_all('~(?:https?://|www\.)~i',$spam,$links);
if(count($links[0])>2||preg_match('/(.)\1{12,}/u',$spam))$errors[]='El mensaje fue rechazado por el filtro antispam.';
if($errors!==[])reply(422,['ok'=>false,'message'=>implode(' ',$errors)]);
$ip=isset($_SERVER['REMOTE_ADDR'])?$_SERVER['REMOTE_ADDR']:'sin-ip';$file=sys_get_temp_dir().DIRECTORY_SEPARATOR.'vk-form-'.hash('sha256',$ip).'.json';$now=time();$tries=[];$handle=@fopen($file,'c+');
if($handle!==false){if(flock($handle,LOCK_EX)){$saved=stream_get_contents($handle);$decoded=json_decode($saved?:'[]',true);if(is_array($decoded))$tries=array_values(array_filter($decoded,function($stamp)use($now){return is_int($stamp)&&$stamp>$now-900;}));if(count($tries)>=3){flock($handle,LOCK_UN);fclose($handle);reply(429,['ok'=>false,'message'=>'Recibimos varios intentos. Esperá unos minutos antes de volver a enviar.']);}$tries[]=$now;rewind($handle);ftruncate($handle,0);fwrite($handle,json_encode($tries));fflush($handle);flock($handle,LOCK_UN);}fclose($handle);}
$recipient=$motive==='Recetas particulares'?TO_RECIPES:TO;
$subject='=?UTF-8?B?'.base64_encode('Consulta web: '.$motive.' — '.$name).'?=';
$body=implode("\r\n",['Nueva consulta desde doctoravanesaklima.com.ar','','Nombre: '.$name,'Email: '.$email,'Teléfono: '.$phone,'Motivo: '.$motive,'','Mensaje:',$message,'','Enviado: '.date('Y-m-d H:i:s T')]);
$headers=implode("\r\n",['From: Formulario web <'.FROM.'>','Reply-To: '.$email,'MIME-Version: 1.0','Content-Type: text/plain; charset=UTF-8','Content-Transfer-Encoding: 8bit','Auto-Submitted: auto-generated','X-Mailer: Estudio Ideamos Formulario Web']);
if(!@mail($recipient,$subject,$body,$headers))reply(500,['ok'=>false,'message'=>'No pudimos enviar la consulta. Intentá nuevamente o escribinos por WhatsApp.']);
reply(200,['ok'=>true,'message'=>'Tu consulta fue enviada correctamente. Te responderemos a la brevedad.']);
