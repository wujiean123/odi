/* Offline copy of the app (never of any data). Network first, so updates arrive; cached copy if the network is slow or down. */
var C='odi-app-v1',FILES=['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];
self.addEventListener('install',function(e){self.skipWaiting();e.waitUntil(caches.open(C).then(function(c){return Promise.all(FILES.map(function(f){return c.add(f).catch(function(){})}))}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(n){return n!==C}).map(function(n){return caches.delete(n)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener('fetch',function(e){
  var u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==self.location.origin)return;
  e.respondWith(new Promise(function(res){
    var done=false,fin=function(r){if(!done&&r){done=true;res(r)}};
    var fallback=function(){return caches.match(e.request,{ignoreSearch:true}).then(function(r){return r||caches.match('./index.html')})};
    var t=setTimeout(function(){fallback().then(fin)},4000);
    fetch(e.request).then(function(r){
      clearTimeout(t);
      if(r&&r.ok){var cp=r.clone();caches.open(C).then(function(c){c.put(e.request,cp)})}
      if(done)return;
      if(r&&r.ok)fin(r);else fallback().then(function(x){fin(x||r)});
    },function(){clearTimeout(t);fallback().then(function(x){fin(x||Response.error())})});
  }));
});
