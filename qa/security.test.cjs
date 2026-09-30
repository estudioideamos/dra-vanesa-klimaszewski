const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const cp=require('node:child_process');
const crypto=require('node:crypto');
const pages=['index.html',...fs.readdirSync('articulos').filter(x=>x.endsWith('.html')).map(x=>'articulos/'+x)];
test('CSP and local resources',()=>{
 for(const page of pages){
  const html=fs.readFileSync(page,'utf8');
  const policy=html.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/)[1];
  assert(!policy.match(/script-src[^;]*unsafe-inline/));
  assert(!policy.includes('frame-ancestors'));
  for(const m of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)){
   JSON.parse(m[1]);
   assert(policy.includes('sha256-'+crypto.createHash('sha256').update(m[1]).digest('base64')));
  }
  for(const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
   const uri=m[1].split(/[?#]/)[0];
   if(!uri||/^(?:[a-z]+:|\/\/)/i.test(uri))continue;
   assert(fs.existsSync(path.resolve(path.dirname(page),uri)),page+' missing '+uri);
  }
 }
});
test('PHP validation, routing, throttling and storage failure; no real mail',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'vanesa-form-test-'));
 const formDir=path.join(dir,'public_html','formularios');
 fs.mkdirSync(formDir,{recursive:true});
 const endpoint=path.join(formDir,'contacto.php');
 fs.copyFileSync('nuthost-formulario/contacto.php',endpoint);
 const capture=path.join(dir,'mail.json');
 const php=process.env.PHP_BIN||'php';
 const base={Nombre:'Prueba técnica',email:'test@example.com','Teléfono':'1100000000',Motivo:'Otra consulta',Mensaje:'Prueba aislada sin enviar mensajes.',website:'',form_started_at:String(Date.now()-10000)};
 const server={REQUEST_METHOD:'POST',HTTP_ORIGIN:'https://doctoravanesaklima.com.ar',CONTENT_TYPE:'application/x-www-form-urlencoded',CONTENT_LENGTH:'500',REMOTE_ADDR:'127.0.0.1'};
 const wrapper="function mail($to,$subject,$body,$headers){global $argv;file_put_contents($argv[2],json_encode([$to,$subject,$body,$headers]));return true;} $_SERVER=json_decode(base64_decode($argv[3]),true);$_POST=json_decode(base64_decode($argv[4]),true);register_shutdown_function(function(){fwrite(STDERR,'STATUS:'.(http_response_code()?:200));});require $argv[1];";
 const run=(fields={},headers={})=>{
  const p=cp.spawnSync(php,['-d','log_errors=1','-d','error_log=','-d','disable_functions=mail','-r',wrapper,endpoint,capture,Buffer.from(JSON.stringify({...server,...headers})).toString('base64'),Buffer.from(JSON.stringify({...base,...fields})).toString('base64')],{encoding:'utf8'});
  assert.equal(p.status,0,p.error?.message||p.stderr);
  return {status:Number(p.stderr.match(/STATUS:(\d+)/)?.[1]),body:JSON.parse(p.stdout)};
 };
 try{
  assert.equal(run({}, {HTTP_ORIGIN:'https://evil.example',HTTP_REFERER:'https://doctoravanesaklima.com.ar/'}).status,403);
  assert.equal(run({}, {HTTP_ORIGIN:'https://estudioideamos.github.io'}).status,403);
  assert.equal(run({}, {CONTENT_TYPE:'application/json'}).status,415);
  assert.equal(run({}, {CONTENT_LENGTH:'40000'}).status,413);
  assert.equal(run({Nombre:'Nombre\r\nBcc: attack@example.com'}).status,422);
  assert.equal(run({email:'invalid'}).status,422);
  assert.equal(run({Motivo:'arbitrary@example.com'}).status,422);
  assert.equal(run({Mensaje:'<script>alert(1)</script>'}).status,422);
  assert.equal(run({Nombre:['array']}).status,422);
  assert.equal(run({form_started_at:String(Date.now())}).status,400);
  assert.equal(run({website:'bot'}).status,200);
  assert(!fs.existsSync(capture));
  assert.equal(run().status,200);
  assert.equal(JSON.parse(fs.readFileSync(capture))[0],'klivanedoc@gmail.com');
  assert.equal(run({Motivo:'Recetas particulares'}).status,200);
  assert.equal(JSON.parse(fs.readFileSync(capture))[0],'pedidoreceta@gmail.com');
  assert.equal(run().status,200);
  assert.equal(run().status,429);
  const statePath=path.join(dir,'.vanesa-form-private','rate-limit.json');
  fs.writeFileSync(statePath,JSON.stringify(Array.from({length:60},(_,i)=>({at:Math.floor(Date.now()/1000),ip:'other-'+i}))));
  assert.equal(run().status,429);
  fs.writeFileSync(statePath,'invalid json');
  assert.equal(run().status,503);
  fs.writeFileSync(statePath,'[]');
  assert.equal(run().status,200);
 }finally{
  fs.rmSync(dir,{recursive:true,force:true});
 }
});