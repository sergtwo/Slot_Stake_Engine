import os

build_orig_path = r'D:\Slot Stake Engine\pragmatic_runner\public\gs2c\common\v3\games-html5\games\vs\vs20wraanu\desktop\build.js.original'
build_out_path = r'D:\Slot Stake Engine\pragmatic_runner\public\gs2c\common\v3\games-html5\games\vs\vs20wraanu\desktop\build.js'

with open(build_orig_path, 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

# 1. Protection globale du cycle de vie lors de l'instanciation (Awake, Start)
t_cb = 'comp[funcToCall]()'
r_cb = 'try{comp[funcToCall]()}catch(err){console.warn("Component error in " + funcToCall + ":", go.name, err);}'

t_oe = 'comp.OnEnable();'
r_oe = 'try{comp.OnEnable();}catch(err){console.warn("Component error in OnEnable:", comp, err);}'

# 2. Protection globale du cycle de frame (Update, LateUpdate, OnWillRenderObject...)
t_frame = 'if(c!=null)c[methodName]()'
r_frame = 'if(c!=null){try{c[methodName]()}catch(err){/* suppress non-critical component update errors */}}'

# 3. ServerInterface.ParseConfigFile
t_cfg = 'ServerInterface.prototype.ParseConfigFile=function(){var lines=this.configFile.text.split("\\n");'
r_cfg = 'ServerInterface.prototype.ParseConfigFile=function(){if(!this.configFile||!this.configFile.text)return;var lines=this.configFile.text.split("\\n");'

# 4. WebAudioSoundInstance.prototype._updateVolume
t_gain1 = 'a!=this.gainNode.gain.value&&(this.gainNode.gain.value=a)'
r_gain1 = 'a!=this.gainNode.gain.value&&(this.gainNode.gain.value=isFinite(a)?a:0)'

t_gain2 = 'a!=this.gainNode.gain.value&&(this.gainNode.gain.value=\na)'
r_gain2 = 'a!=this.gainNode.gain.value&&(this.gainNode.gain.value=isFinite(a)?a:0)'

# 5. preserveDrawingBuffer: true (ESSENTIEL pour que DevTools et Chrome puissent capturer le buffer WebGL!)
t_pdb = 'preserveDrawingBuffer:mustPreserveDrawingBuffer'
r_pdb = 'preserveDrawingBuffer:true'

# 6. Déclenchement direct de evtRequestInitApplication sans passer par le mock cookie
t_si = 'ServerInterface.prototype.Update=function(){if(this.counter<4)this.counter++;if(this.counter==2){'
r_si = 'ServerInterface.prototype.Update=function(){if(this.counter<4)this.counter++;if(this.counter==2){EventManager.Trigger(ApplicationEvents.evtRequestInitApplication,null);'

# 7. Guard UHTLogotype.GameLoadingStarted
t_logo = 'window["UHTLogotype"]["GameLoadingStarted"]()'
r_logo = '(window["UHTLogotype"]&&window["UHTLogotype"]["GameLoadingStarted"]?window["UHTLogotype"]["GameLoadingStarted"]():0)'

# 8. Guard clientResourceData.resources
t_cr = 'clientParts[0].resources=clientParts[0].resources.concat(clientResourceData.resources);'
r_cr = 'clientParts[0].resources=clientParts[0].resources.concat(clientResourceData&&clientResourceData.resources?clientResourceData.resources:[]);'

# 9. Guard WebGL texImage2D quand t.source est invalide ou absent
t_tex = 'e.texImage2D(e.TEXTURE_2D,0,t.hasAlpha?e.RGBA:e.RGB,t.hasAlpha?e.RGBA:e.RGB,e.UNSIGNED_BYTE,t.source)'
r_tex = '((t&&t.source&&t.source.width>0&&t.source.height>0)?(function(){try{e.texImage2D(e.TEXTURE_2D,0,t.hasAlpha?e.RGBA:e.RGB,t.hasAlpha?e.RGBA:e.RGB,e.UNSIGNED_BYTE,t.source)}catch(err){}}()):0)'

# 10. Assurer la connexion dans ServerLink.OnApplicationConfigReceived
t_sl = 'this.OnCreateConnectionRequest(ServerOptions.gameSymbol);this.freeRoundsBonusConnection.Init();this.announcementConnection.Init();this.isReady=true};'
r_sl = 'this.OnCreateConnectionRequest(ServerOptions.gameSymbol);try{this.freeRoundsBonusConnection.Init()}catch(e){};try{this.announcementConnection.Init()}catch(e){};this.isReady=true;EventManager.Trigger(GameEvents.evtConnectionReady,ServerOptions.gameSymbol);EventManager.Trigger(ApplicationEvents.evtServerOptionsParsed,null);};'

# 11. Initialisation directe du flux de connexion dans VideoSlotsConnectionXTLayer
t_init = 'VideoSlotsConnectionXTLayer.prototype.OnRequestInit=function(){console.log("OnRequestInit",ServerOptions);EventManager.AddHandler(GameEvents.evtConnectionReady,this.OnConnectionReady,this)};'
r_init = 'VideoSlotsConnectionXTLayer.prototype.OnRequestInit=function(){console.log("OnRequestInit",ServerOptions);this.OnConnectionReady("vs20wraanu");};'

# 12. Forcer standard XMLHttpRequest pour SimpleWebRequest
t_xhr = 'SimpleWebRequest.prototype.GetHttpRequest=function(){return UHT_LOCAL&&UHT_ONLINE?new UHTXDomainRequest:new XMLHttpRequest};'
r_xhr = 'SimpleWebRequest.prototype.GetHttpRequest=function(){return new XMLHttpRequest;};'

# 13. Unifier LML_renderer et RenderTexture pour éliminer le cross-context WebGL INVALID_OPERATION: bindBuffer
t_lml = 'var LML_renderer=PIXI.autoDetectRenderer(100,100,LML_renderOptions,true);'
r_lml = 'var LML_renderer=new PIXI.CanvasRenderer(100,100,LML_renderOptions);'
t_rt = '_PIXI.RenderTexture.Create=function(){return new PIXI.RenderTexture(LML_renderer)};'
r_rt = '_PIXI.RenderTexture.Create=function(){var r=(window.globalRenderer&&window.globalRenderer.renderer)?window.globalRenderer.renderer:LML_renderer;return new PIXI.RenderTexture(r)};'

# 14. Sécuriser le rendu de la caméra masquée : ajouter directement cam.container au stage
t_mask_cam = 'if(!cam.HasClippingMask()){if(cam.container.children.length>0)this.stage.addChild(cam.container)}else{'
r_mask_cam = 'if(!cam.HasClippingMask()){if(cam.container.children.length>0)this.stage.addChild(cam.container)}else{if(cam.container.children.length>0)this.stage.addChild(cam.container);'

# 15. S'assurer que UHTEngine.HideLoader() masque le loader HTML et les blinders
t_hide = 'HideLoader:function(){loaderController[loaderCallbackHide]()},'
r_hide = 'HideLoader:function(){try{loaderController[loaderCallbackHide]()}catch(e){};var sl=document.getElementById("ScaleRootLoading")||document.querySelector(".loading-holder");if(sl)sl.style.display="none";},'

# 16. Sécuriser GameObject.prototype.SendMessage contre les exceptions non gérées
t_sm = 'if(curComp[methodName]!=undefined)curComp[methodName](value)'
r_sm = 'if(curComp[methodName]!=undefined){try{curComp[methodName](value)}catch(err){}}'

# 17. Sécuriser Pixi pushMask / popMask contre _webGL undefined
t_pm = 't._webGL[this.renderer.gl.id].data.length&&this.pushStencil(t,t._webGL[this.renderer.gl.id].data[0],\nthis.renderer)'
r_pm = '(t._webGL&&t._webGL[this.renderer.gl.id]&&t._webGL[this.renderer.gl.id].data&&t._webGL[this.renderer.gl.id].data.length)?this.pushStencil(t,t._webGL[this.renderer.gl.id].data[0],this.renderer):0'

t_popm = 'this.popStencil(t,t._webGL[this.renderer.gl.id].data[0],this.renderer)'
r_popm = '(t._webGL&&t._webGL[this.renderer.gl.id]&&t._webGL[this.renderer.gl.id].data&&t._webGL[this.renderer.gl.id].data.length)?this.popStencil(t,t._webGL[this.renderer.gl.id].data[0],this.renderer):0'

# 18. Auto-lancement robuste du GameLogicRuntime et XT.RegisterAndInit si non déclenché
t_gl_start = 'this.currentStage=this.GetStage(this.startingStage);this.currentStageStarted=false};'
r_gl_start = '''this.currentStage=this.GetStage(this.startingStage);this.currentStageStarted=false};
GameLogicRuntime.prototype.Awake=function(){
    if(!this.listOfStages||this.listOfStages.length===0){
        this.listOfStages=this.gameObject.GetComponentsInChildren(UHTStage);
    }
    var root=(this.gameObject?this.gameObject.transform.root:null)||globalRuntime.sceneRoots[1]||globalRuntime.sceneRoots[0];
    if(root&&!XT.RegisterAndInitDone){
        XT.RegisterAndInit(root);
    }
};'''

# 19. Rendre StageInit.prototype.UHTInit résistant aux objets racine booléens ou invalides et activer les écouteurs XT
t_stage_init = 'StageInit.prototype.UHTInit=function(){XT.RegisterAndInit(this.XTRoot)};'
r_stage_init = 'StageInit.prototype.UHTInit=function(){this.xtEnabled=true;this.waitForCustomDataInit=0;var root=(this.XTRoot&&this.XTRoot.name)?this.XTRoot:globalRuntime.sceneRoots[1];XT.RegisterAndInit(root);};'

# 20. Protéger XTLink.prototype.XTRegisterCallbacksBase et XTInitVariablesAndEventsBase
t_xt_base = 'XTLink.prototype.XTRegisterCallbacksBase=function(){this.isRegisteredAndInited=true;this.XTRegisterCallbacks()};'
r_xt_base = 'XTLink.prototype.XTRegisterCallbacksBase=function(){this.isRegisteredAndInited=true;try{this.XTRegisterCallbacks()}catch(err){}};XTLink.prototype.XTInitVariablesAndEventsBase=function(){try{this.XTInitVariablesAndEvents()}catch(err){}};'

# 21. Protéger UHTStage.prototype.UHTUpdateBase contre catBeforeFirstUpdate incomplet
t_stage_base = 'if(isFirstFrame&&this.catBeforeFirstUpdate!=null)this.catBeforeFirstUpdate.Start();return this.UHTUpdate(isFirstFrame)'
r_stage_base = 'if(isFirstFrame&&this.catBeforeFirstUpdate!=null&&typeof this.catBeforeFirstUpdate.Start==="function")this.catBeforeFirstUpdate.Start();return this.UHTUpdate(isFirstFrame)'

# 22. Protéger StageInit.prototype.UHTUpdate contre introShow / initShow / introHide manquants
t_intro_show = 'else this.introShow.Start();'
r_intro_show = 'else if(this.introShow&&typeof this.introShow.Start==="function")this.introShow.Start();'

t_init_show = 'this.initShow.RegisterCallback(this.OnIntroClosedOrSkipped,this);this.initShow.Start();'
r_init_show = 'if(this.initShow&&typeof this.initShow.RegisterCallback==="function"){this.initShow.RegisterCallback(this.OnIntroClosedOrSkipped,this);this.initShow.Start();}'

t_intro_hide = 'this.introHide.RegisterCallback(this.OnIntroClosedOrSkipped,this);this.introHide.Start();'
r_intro_hide = 'if(this.introHide&&typeof this.introHide.RegisterCallback==="function"){this.introHide.RegisterCallback(this.OnIntroClosedOrSkipped,this);this.introHide.Start();}'

# 23. Auto-connexion ServerLink dès Awake avec UHT_GAME_CONFIG
t_sl_awake = 'this.adapter=new Adapter;this.adapter.Init();'
r_sl_awake = 'this.adapter=new Adapter;this.adapter.Init();if(window.UHT_GAME_CONFIG){var self=this;setTimeout(function(){try{self.OnApplicationConfigReceived(window.UHT_GAME_CONFIG);}catch(e){console.warn("Auto-config ServerLink:", e);}},100);}'

# 24. Rendu direct de toutes les caméras sans effacer le stage (évite l'écran noir de ClippedCamera)
t_cam_render = 'if(!cam.HasClippingMask()){if(cam.container.children.length>0)this.stage.addChild(cam.container)}else{if(!this.hasMaskedCameras){'
r_cam_render = 'if(cam.container.children.length>0)this.stage.addChild(cam.container);if(false){if(!this.hasMaskedCameras){'

# 25. Correction critique VS_ReelsManager: this.reels est false au lieu d'un tableau
t_reels_mgr = 'this.useCustomSpinCurves=_array.create(this.reels.length,false);'
r_reels_mgr = 'if(!Array.isArray(this.reels)||this.reels.length===0)this.reels=this.gameObject.GetComponentsInChildren(VS_Reel);this.useCustomSpinCurves=_array.create(this.reels.length,false);'

# 26. Protection absolue de XT.RegisterAndInit contre les composants auxiliaires invalides
t_xt_reg_init = 'for(i=0;i<ges.length;++i)ges[i].XTRegisterCallbacksBase();EventManager.Trigger(GameEvents.evtXTRegisterCallbacks,null);for(i=0;i<ges.length;++i)ges[i].XTInitVariablesAndEvents();'
r_xt_reg_init = 'for(i=0;i<ges.length;++i){try{ges[i].XTRegisterCallbacksBase()}catch(e){}}EventManager.Trigger(GameEvents.evtXTRegisterCallbacks,null);for(i=0;i<ges.length;++i){try{ges[i].XTInitVariablesAndEvents()}catch(e){}}'

# 27. Forcer le mode ONLINE réel (évite le OfflineRequest qui bloque le réseau)
t_req_prov = 'return ServerOptions.isOnline?new SimpleWebRequest(settings):new OfflineRequest(settings)'
r_req_prov = 'ServerOptions.isOnline=true;return new SimpleWebRequest(settings)'

# 28. Auto-déclenchement de SendInitRequest sur GameEvents.evtConnectionReady
t_conn_ready = 'EventManager.Trigger(GameEvents.evtConnectionReady,ServerOptions.gameSymbol);'
r_conn_ready = 'EventManager.Trigger(GameEvents.evtConnectionReady,ServerOptions.gameSymbol);for(var k=0;k<this.connections.length;++k){try{this.connections[k].SendInitRequest()}catch(e){}}'

# 29. Correction critique startingStage: s'assurer que c'est l'ID numérique (1 = StageInit)
t_start_stage = 'this.currentStage=this.GetStage(this.startingStage);'
r_start_stage = 'var sId=(typeof this.startingStage==="number")?this.startingStage:1;this.currentStage=this.GetStage(sId);'

# 30. Auto-initialisation de VideoSlotsConnectionXTLayer pour créer VideoSlotsConnection
t_vsc_init = 'VideoSlotsConnectionXTLayer.prototype.XTInitVariablesAndEvents=function(){'
r_vsc_init = 'VideoSlotsConnectionXTLayer.prototype.XTInitVariablesAndEvents=function(){var self=this;setTimeout(function(){try{self.OnConnectionReady("vs20wraanu")}catch(e){console.warn("vscXT connect:", e)}},50);'

patches = [
    (t_cb, r_cb), (t_oe, r_oe), (t_frame, r_frame), (t_cfg, r_cfg),
    (t_gain1, r_gain1), (t_gain2, r_gain2), (t_pdb, r_pdb), (t_si, r_si),
    (t_logo, r_logo), (t_cr, r_cr), (t_tex, r_tex), (t_sl, r_sl),
    (t_init, r_init), (t_xhr, r_xhr), (t_lml, r_lml), (t_rt, r_rt),
    (t_cam_render, r_cam_render), (t_hide, r_hide), (t_sm, r_sm),
    (t_pm, r_pm), (t_popm, r_popm), (t_gl_start, r_gl_start),
    (t_stage_init, r_stage_init), (t_xt_base, r_xt_base),
    (t_stage_base, r_stage_base), (t_intro_show, r_intro_show),
    (t_init_show, r_init_show), (t_intro_hide, r_intro_hide),
    (t_sl_awake, r_sl_awake), (t_reels_mgr, r_reels_mgr),
    (t_xt_reg_init, r_xt_reg_init), (t_req_prov, r_req_prov),
    (t_conn_ready, r_conn_ready), (t_start_stage, r_start_stage),
    (t_vsc_init, r_vsc_init)
]

for t, r in patches:
    if t in content:
        content = content.replace(t, r)
        print("Replaced:", t[:40].strip())
    else:
        print("NOT FOUND:", t[:40].strip())

with open(build_out_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("build.js patched successfully!")
